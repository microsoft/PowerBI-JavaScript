// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BookmarksPlayMode,
  IApplyBookmarkByNameRequest,
  IApplyBookmarkStateRequest,
  ICaptureBookmarkOptions,
  ICaptureBookmarkRequest,
  IPlayBookmarkRequest,
  IReportBookmark

} from 'powerbi-models';
import { IHttpPostMessageResponse } from 'http-post-message';
import { Service } from './service';
import { IEmbedConfigurationBase } from './embed';
import { isRDLEmbed } from './util';
import { APINotSupportedForRDLError } from './errors';

/**
 * APIs for managing the report bookmarks.
 *
 * @export
 * @interface IBookmarksManager
 */
export interface IBookmarksManager {
  getBookmarks(): Promise<IReportBookmark[]>;
  apply(bookmarkName: string): Promise<IHttpPostMessageResponse<void>>;
  play(playMode: BookmarksPlayMode): Promise<IHttpPostMessageResponse<void>>;
  capture(options?: ICaptureBookmarkOptions): Promise<IReportBookmark>;
  applyState(state: string): Promise<IHttpPostMessageResponse<void>>;
}

/**
 * Manages report bookmarks.
 *
 * @export
 * @class BookmarksManager
 * @implements {IBookmarksManager}
 */
export class BookmarksManager implements IBookmarksManager {
  /**
   * @hidden
   */
  constructor(private service: Service, private config: IEmbedConfigurationBase, private iframe?: HTMLIFrameElement) {
  }

  /**
   * Gets bookmarks that are defined in the report.
   *
   * ```javascript
   * // Gets bookmarks that are defined in the report
   * bookmarksManager.getBookmarks()
   *   .then(bookmarks => {
   *     ...
   *   });
   * ```
   *
   * @returns {Promise<IReportBookmark[]>}
   */
  async getBookmarks(): Promise<IReportBookmark[]> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    try {
      const response = await this.service.hpm.get<IReportBookmark[]>(`/report/bookmarks`, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Apply bookmark by name.
   *
   * ```javascript
   * bookmarksManager.apply(bookmarkName)
   * ```
   *
   * @param {string} bookmarkName The name of the bookmark to be applied
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async apply(bookmarkName: string): Promise<IHttpPostMessageResponse<void>> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    const request: IApplyBookmarkByNameRequest = {
      name: bookmarkName
    };

    try {
      return await this.service.hpm.post<void>(`/report/bookmarks/applyByName`, request, { uid: this.config.uniqueId }, this.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Play bookmarks: Enter or Exit bookmarks presentation mode.
   *
   * ```javascript
   * // Enter presentation mode.
   * bookmarksManager.play(BookmarksPlayMode.Presentation)
   * ```
   *
   * @param {BookmarksPlayMode} playMode Play mode can be either `Presentation` or `Off`
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async play(playMode: BookmarksPlayMode): Promise<IHttpPostMessageResponse<void>> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    const playBookmarkRequest: IPlayBookmarkRequest = {
      playMode: playMode
    };

    try {
      return await this.service.hpm.post<void>(`/report/bookmarks/play`, playBookmarkRequest, { uid: this.config.uniqueId }, this.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Capture bookmark from current state.
   *
   * ```javascript
   * bookmarksManager.capture(options)
   * ```
   *
   * @param {ICaptureBookmarkOptions} [options] Options for bookmark capturing
   * @returns {Promise<IReportBookmark>}
   */
  async capture(options?: ICaptureBookmarkOptions): Promise<IReportBookmark> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    const request: ICaptureBookmarkRequest = {
      options: options || {}
    };

    try {
      const response = await this.service.hpm.post<IReportBookmark>(`/report/bookmarks/capture`, request, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Apply bookmark state.
   *
   * ```javascript
   * bookmarksManager.applyState(bookmarkState)
   * ```
   *
   * @param {string} state A base64 bookmark state to be applied
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async applyState(state: string): Promise<IHttpPostMessageResponse<void>> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    const request: IApplyBookmarkStateRequest = {
      state: state
    };

    try {
      return await this.service.hpm.post<void>(`/report/bookmarks/applyState`, request, { uid: this.config.uniqueId }, this.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }
}
