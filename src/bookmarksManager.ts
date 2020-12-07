import * as service from './service';
import * as embed from './embed';
import * as models from 'powerbi-models';
import * as utils from './util';
import * as errors from './errors';
import { IHttpPostMessageResponse } from 'http-post-message';

/**
 * APIs for managing the report bookmarks.
 *
 * @export
 * @interface IBookmarksManager
 */
export interface IBookmarksManager {
  getBookmarks(): Promise<models.IReportBookmark[]>;
  apply(bookmarkName: string): Promise<IHttpPostMessageResponse<void>>;
  play(playMode: models.BookmarksPlayMode): Promise<IHttpPostMessageResponse<void>>;
  capture(options?: models.ICaptureBookmarkOptions): Promise<models.IReportBookmark>;
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
  constructor(private service: service.Service, private config: embed.IEmbedConfigurationBase, private iframe?: HTMLIFrameElement) {
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
   * @returns {Promise<models.IReportBookmark[]>}
   */
  async getBookmarks(): Promise<models.IReportBookmark[]> {
    if (utils.isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(errors.APINotSupportedForRDLError);
    }

    try {
      const response = await this.service.hpm.get<models.IReportBookmark[]>(`/report/bookmarks`, { uid: this.config.uniqueId }, this.iframe.contentWindow);
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
    if (utils.isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(errors.APINotSupportedForRDLError);
    }

    var request: models.IApplyBookmarkByNameRequest = {
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
   * bookmarksManager.play(models.BookmarksPlayMode.Presentation)
   * ```
   *
   * @param {models.BookmarksPlayMode} playMode Play mode can be either `Presentation` or `Off`
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async play(playMode: models.BookmarksPlayMode): Promise<IHttpPostMessageResponse<void>> {
    if (utils.isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(errors.APINotSupportedForRDLError);
    }

    var playBookmarkRequest: models.IPlayBookmarkRequest = {
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
   * @param {models.ICaptureBookmarkOptions} [options] Options for bookmark capturing
   * @returns {Promise<models.IReportBookmark>}
   */
  async capture(options?: models.ICaptureBookmarkOptions): Promise<models.IReportBookmark> {
    if (utils.isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(errors.APINotSupportedForRDLError);
    }

    var request: models.ICaptureBookmarkRequest = {
      options: options || {}
    };

    try {
      const response = await this.service.hpm.post<models.IReportBookmark>(`/report/bookmarks/capture`, request, { uid: this.config.uniqueId }, this.iframe.contentWindow);
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
    if (utils.isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(errors.APINotSupportedForRDLError);
    }

    var request: models.IApplyBookmarkStateRequest = {
      state: state
    };

    try {
      return await this.service.hpm.post<void>(`/report/bookmarks/applyState`, request, { uid: this.config.uniqueId }, this.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }
}
