"use client";

import { useEffect, useRef, useState } from "react";
import { MIN_BIRTH_YEAR } from "@/lib/age-ranges";
import type { GeneratedPlaylist } from "@/lib/types";
import { BirthYearForm } from "@/components/BirthYearForm";
import { EmptyState } from "@/components/EmptyState";
import { EqualizerBars } from "@/components/Decorations";
import { PlaylistPreview } from "@/components/PlaylistPreview";
import { SpotifyButton } from "@/components/SpotifyButton";
import styles from "./NostalgiaApp.module.css";

const PLAYLIST_STORAGE_KEY = "nostalgia-fm-playlist";

interface NostalgiaAppProps {
    spotifyStatus?: string;
    spotifyReason?: string;
}

export function NostalgiaApp({
    spotifyStatus,
    spotifyReason,
}: NostalgiaAppProps) {
    const [playlist, setPlaylist] = useState<GeneratedPlaylist | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedPlaylistUrl, setSavedPlaylistUrl] = useState<string | null>(
        null,
    );
    const previewRef = useRef<HTMLElement>(null);
    const shouldScrollToPreview = useRef(false);

    const spotifyAuthMessage =
        spotifyStatus === "connected"
            ? "Spotify connected successfully."
            : spotifyStatus === "error"
              ? `Spotify connection failed${spotifyReason ? `: ${spotifyReason}` : "."}`
              : null;

    useEffect(() => {
        async function loadState() {
            const statusResponse = await fetch("/api/auth/status");
            const statusData = (await statusResponse.json()) as {
                authenticated: boolean;
            };
            setIsAuthenticated(
                statusData.authenticated || spotifyStatus === "connected",
            );

            const stored = sessionStorage.getItem(PLAYLIST_STORAGE_KEY);
            if (stored) {
                try {
                    setPlaylist(JSON.parse(stored) as GeneratedPlaylist);
                } catch {
                    sessionStorage.removeItem(PLAYLIST_STORAGE_KEY);
                }
            }
        }

        loadState().catch(() => {
            setError("Failed to check Spotify connection.");
        });
    }, [spotifyStatus]);

    useEffect(() => {
        if (!playlist || !shouldScrollToPreview.current) {
            return;
        }

        shouldScrollToPreview.current = false;

        requestAnimationFrame(() => {
            previewRef.current?.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                    .matches
                    ? "auto"
                    : "smooth",
                block: "start",
            });
        });
    }, [playlist]);

    async function handleGenerate(birthYear: number) {
        setIsGenerating(true);
        setError(null);
        setSavedPlaylistUrl(null);

        try {
            const controller = new AbortController();
            const timeoutId = window.setTimeout(
                () => controller.abort(),
                180_000,
            );

            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ birthYear }),
                signal: controller.signal,
            });

            window.clearTimeout(timeoutId);

            const data = (await response.json()) as
                | GeneratedPlaylist
                | { error: string };

            if (!response.ok) {
                throw new Error(
                    "error" in data
                        ? data.error
                        : "Failed to generate playlist.",
                );
            }

            const generated = data as GeneratedPlaylist;
            shouldScrollToPreview.current = true;
            setPlaylist(generated);
            sessionStorage.setItem(
                PLAYLIST_STORAGE_KEY,
                JSON.stringify(generated),
            );
        } catch (generateError) {
            setPlaylist(null);
            sessionStorage.removeItem(PLAYLIST_STORAGE_KEY);

            if (
                generateError instanceof DOMException &&
                generateError.name === "AbortError"
            ) {
                setError(
                    "Generation timed out. Spotify rate limits can slow things down — please try again in a moment.",
                );
                return;
            }

            setError(
                generateError instanceof Error
                    ? generateError.message
                    : "Failed to generate playlist.",
            );
        } finally {
            setIsGenerating(false);
        }
    }

    async function handleSave() {
        if (!playlist) {
            return;
        }

        if (!isAuthenticated) {
            sessionStorage.setItem(
                PLAYLIST_STORAGE_KEY,
                JSON.stringify(playlist),
            );
            window.location.href = "/api/auth/spotify";
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const response = await fetch("/api/playlists/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(playlist),
            });

            const data = (await response.json()) as
                | { playlistUrl: string }
                | { error: string };

            if (!response.ok) {
                throw new Error(
                    "error" in data ? data.error : "Failed to save playlist.",
                );
            }

            if ("playlistUrl" in data) {
                setSavedPlaylistUrl(data.playlistUrl);
                sessionStorage.removeItem(PLAYLIST_STORAGE_KEY);
            }
        } catch (saveError) {
            setError(
                saveError instanceof Error
                    ? saveError.message
                    : "Failed to save playlist.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className={styles.app}>
            <section className={styles.heroForm}>
                <BirthYearForm
                    minYear={MIN_BIRTH_YEAR}
                    maxYear={new Date().getFullYear()}
                    isLoading={isGenerating}
                    onSubmit={handleGenerate}
                />

                {isGenerating && (
                    <div className={styles.loading} role="status">
                        <div className={styles.loadingBars}>
                            <EqualizerBars />
                        </div>
                        <p className={styles.loadingText}>
                            Tuning your stations… usually takes 30–60 seconds.
                        </p>
                    </div>
                )}

                {error && (
                    <p className={styles.errorMessage} role="alert">
                        {error}
                    </p>
                )}
                {spotifyAuthMessage && (
                    <p
                        className={
                            spotifyStatus === "error"
                                ? styles.errorMessage
                                : styles.successMessage
                        }
                        role="status"
                    >
                        {spotifyAuthMessage}
                    </p>
                )}
            </section>

            {!playlist && !isGenerating && <EmptyState />}

            {playlist && (
                <section ref={previewRef} className={styles.previewSection}>
                    <PlaylistPreview playlist={playlist} />
                    <SpotifyButton
                        isAuthenticated={isAuthenticated}
                        isSaving={isSaving}
                        onSave={handleSave}
                    />
                    {savedPlaylistUrl && (
                        <a
                            href={savedPlaylistUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.savedLink}
                        >
                            Open playlist in Spotify →
                        </a>
                    )}
                </section>
            )}
        </div>
    );
}
