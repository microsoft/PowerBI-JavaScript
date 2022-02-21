// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

declare global {
  interface Window {
    __karma__: any;
  }
}

export const iframeSrc = "base/test/utility/noop.html";
window.onbeforeunload = null;

