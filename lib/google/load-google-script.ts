const scriptSource = "https://accounts.google.com/gsi/client";

let scriptPromise: Promise<void> | null = null;

export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[src="${scriptSource}"]`,
  );

  if (existingScript) {
    scriptPromise = Promise.resolve();
    return scriptPromise;
  }

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptSource;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity script"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

