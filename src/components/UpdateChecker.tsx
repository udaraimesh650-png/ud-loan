import React, { useEffect, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const GITHUB_REPO = 'udaraimesh650-png/ud-loan';

interface GitHubRelease {
  tag_name: string;
  html_url: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
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

export function UpdateChecker() {
  const [latestVersion, setLatestVersion] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const checkForUpdate = async () => {
      if (!Capacitor.isNativePlatform()) return;

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

        if (!response.ok) return;

        const release: GitHubRelease = await response.json();

        if (!isNewerVersion(release.tag_name, currentVersion)) return;

        const apk = release.assets.find((asset) =>
          asset.name.toLowerCase().endsWith('.apk')
        );

        if (!apk) return;

        setLatestVersion(release.tag_name.replace(/^v/i, ''));
        setDownloadUrl(apk.browser_download_url);
        setShowUpdate(true);
      } catch (error) {
        console.log('Update check failed:', error);
      }
    };

    checkForUpdate();
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-5">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
        <div className="mb-3 text-4xl">🔄</div>

        <h2 className="text-xl font-extrabold text-slate-900">
          New Update Available
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          UD Loan Calculator version {latestVersion} is now available.
        </p>

        <button
          onClick={() => {
            window.location.href = downloadUrl;
          }}
          className="mt-5 w-full rounded-xl bg-sky-600 px-4 py-3 font-bold text-white"
        >
          DOWNLOAD & UPDATE
        </button>

        <button
          onClick={() => setShowUpdate(false)}
          className="mt-2 w-full rounded-xl px-4 py-2 text-sm font-semibold text-slate-500"
        >
          LATER
        </button>
      </div>
    </div>
  );
}
