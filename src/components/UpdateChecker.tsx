import React, { useEffect, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileTransfer } from '@capacitor/file-transfer';
import { FileOpener } from '@capacitor-community/file-opener';

const GITHUB_REPO = 'udaraimesh650-png/ud-loan';

interface GitHubRelease {
  tag_name: string;
  body?: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
  }>;
}

function versionToNumbers(version: string): number[] {
  return version
    .replace(/^v/i, '')
    .split('.')
    .map((part) => Number(part) || 0);
}

function isNewerVersion(latest: string, current: string): boolean {
  const a = versionToNumbers(latest);
  const b = versionToNumbers(current);
  const length = Math.max(a.length, b.length);

  for (let i = 0; i < length; i++) {
    const latestPart = a[i] || 0;
    const currentPart = b[i] || 0;

    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }

  return false;
}

function bytesToMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function UpdateChecker() {
  const [latestVersion, setLatestVersion] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [apkSize, setApkSize] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [showUpdate, setShowUpdate] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    const checkForUpdate = async () => {
      if (!Capacitor.isNativePlatform()) {
        return;
      }

      try {
        const appInfo = await CapacitorApp.getInfo();
        const currentVersion = appInfo.version;

        const response = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
          {
            headers: {
              Accept: 'application/vnd.github+json',
            },
          }
        );

        if (!response.ok) {
          console.error(
            'GitHub update check failed:',
            response.status,
            response.statusText
          );
          return;
        }

        const release: GitHubRelease = await response.json();

        if (!isNewerVersion(release.tag_name, currentVersion)) {
          return;
        }

        const apk = release.assets.find((asset) =>
          asset.name.toLowerCase().endsWith('.apk')
        );

        if (!apk) {
          console.error('No APK found in latest GitHub release.');
          return;
        }

        setLatestVersion(release.tag_name.replace(/^v/i, ''));
        setDownloadUrl(apk.browser_download_url);
        setApkSize(bytesToMB(apk.size));

        setReleaseNotes(
          release.body?.trim() ||
            '• යෙදුමේ ක්‍රියාකාරීත්වය වැඩිදියුණු කර ඇත.\n• සුළු දෝෂ නිවැරදි කර ඇත.'
        );

        setShowUpdate(true);
      } catch (error) {
        console.error('Update check failed:', error);
      }
    };

    checkForUpdate();
  }, []);

  const downloadAndInstall = async () => {
    if (!downloadUrl || isDownloading) {
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadError('');

    let progressListener: Awaited<
      ReturnType<typeof FileTransfer.addListener>
    > | null = null;

    try {
      const fileName = `UD-Loan-Calculator-v${latestVersion}.apk`;

      const uriResult = await Filesystem.getUri({
        directory: Directory.Cache,
        path: fileName,
      });

      console.log('APK download URL:', downloadUrl);
      console.log('APK destination URI:', uriResult.uri);

      progressListener = await FileTransfer.addListener(
        'progress',
        (status) => {
          if (
            status.type === 'download' &&
            status.lengthComputable &&
            status.contentLength > 0
          ) {
            const percent = Math.round(
              (status.bytes / status.contentLength) * 100
            );

            setDownloadProgress(Math.min(percent, 100));
          }
        }
      );

      const result = await FileTransfer.downloadFile({
        url: downloadUrl,
        path: uriResult.uri,
        progress: true,
        method: 'GET',
        connectTimeout: 60000,
        readTimeout: 120000,
      });

      if (progressListener) {
        await progressListener.remove();
        progressListener = null;
      }

      setDownloadProgress(100);

      const apkPath = result.path || uriResult.uri;

      console.log('APK downloaded successfully:', apkPath);

      await FileOpener.open({
        filePath: apkPath,
        contentType: 'application/vnd.android.package-archive',
        openWithDefault: true,
      });

      console.log('Android APK installer requested.');
    } catch (error) {
      console.error('Update download/install failed:', error);

      const message = getErrorMessage(error);

      setDownloadError(`ERROR: ${message}`);
      setIsDownloading(false);
    } finally {
      if (progressListener) {
        try {
          await progressListener.remove();
        } catch {
          // Ignore listener cleanup errors.
        }
      }
    }
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-5">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="text-center">
          <div className="mb-3 text-4xl">🔄</div>

          <h2 className="text-xl font-extrabold text-slate-900">
            නව යාවත්කාලීන කිරීමක් ඇත
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            UD Loan Calculator{' '}
            <span className="font-bold text-slate-900">
              v{latestVersion}
            </span>{' '}
            අනුවාදය දැන් ලබා ගත හැක.
          </p>

          <div className="mt-3 inline-flex rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700">
            📦 ප්‍රමාණය: {apkSize} MB
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="mb-2 text-sm font-extrabold text-slate-800">
            🆕 මෙම යාවත්කාලීනයේ අලුත් දේ
          </p>

          <div className="max-h-36 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {releaseNotes}
          </div>
        </div>

        {isDownloading && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-700">
              <span>යාවත්කාලීනය බාගත වෙමින් පවතී...</span>
              <span>{downloadProgress}%</span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-sky-600 transition-all duration-300"
                style={{
                  width: `${downloadProgress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-center text-xs text-slate-500">
              බාගත කිරීම අවසන් වන තෙක් යෙදුම වසා නොදමන්න.
            </p>
          </div>
        )}

        {downloadError && (
          <div className="mt-4 max-h-32 overflow-y-auto rounded-xl bg-red-50 p-3 text-left text-xs font-semibold text-red-600">
            {downloadError}
          </div>
        )}

        <button
          onClick={downloadAndInstall}
          disabled={isDownloading}
          className="mt-5 w-full rounded-xl bg-sky-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDownloading
            ? `බාගත වෙමින්... ${downloadProgress}%`
            : 'යාවත්කාලීන කරන්න'}
        </button>

        {!isDownloading && (
          <button
            onClick={() => setShowUpdate(false)}
            className="mt-2 w-full rounded-xl px-4 py-2 text-sm font-semibold text-slate-500"
          >
            පසුව
          </button>
        )}
      </div>
    </div>
  );
}