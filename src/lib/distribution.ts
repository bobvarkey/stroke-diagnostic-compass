import { Capacitor } from "@capacitor/core";

/** Presentation/checkout boundary only. Never use this to grant premium access. */
export function allowsWebBilling(): boolean {
  return !Capacitor.isNativePlatform();
}

export function requireWebBilling(): void {
  if (!allowsWebBilling()) {
    throw new Error("Web checkout is unavailable in this app.");
  }
}