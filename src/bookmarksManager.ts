import * as service from './service';
import * as embed from './embed';
import * as models from 'powerbi-models';
import * as wpmp from 'window-post-message-proxy';
import * as hpm from 'http-post-message';
import * as utils from './util';
import * as errors from './errors';
import { IPageNode, Page } from './page';
import { Defaults } from './defaults';
import { IReportLoadConfiguration } from 'powerbi-models';

/**
 * Report bookmarks management APIs.
 *
 * @export
 * @interface IBookmarksManager
 */
export interface IBookmarksManager {
    getBookmarks(): Promise<models.IReportBookmark[]>;
    apply(bookmarkName: string): Promise<void>;
    play(playMode: models.BookmarksPlayMode): Promise<void>;

    capture(): Promise<models.IReportBookmark>;
    applyState(state: string): Promise<void>;
}

/**
 * Manages report bookmarks.
 *
 * @export
 * @class BookmarksManager
 * @implements {IBookmarksManager}
 */
export class BookmarksManager implements IBookmarksManager {

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
    getBookmarks(): Promise<models.IReportBookmark[]> {
        if (utils.isRDLEmbed(this.config.embedUrl)) {
            return Promise.reject(errors.APINotSupportedForRDLError);
        }

        return this.service.hpm.get<models.IReportBookmark[]>(`/report/bookmarks`, { uid: this.config.uniqueId }, this.iframe.contentWindow)
            .then(response => response.body,
            response => {
                throw response.body;
            });
    }

    /**
     * Apply bookmark By name.
     *
     * ```javascript
     * bookmarksManager.apply(bookmarkName)
     * ```
     *
     * @returns {Promise<void>}
     */
    apply(bookmarkName: string): Promise<void> {
        if (utils.isRDLEmbed(this.config.embedUrl)) {
            return Promise.reject(errors.APINotSupportedForRDLError);
        }

        var request: models.IApplyBookmarkByNameRequest = {
            name: bookmarkName
        };

        return this.service.hpm.post<models.IError[]>(`/report/bookmarks/applyByName`, request, { uid: this.config.uniqueId }, this.iframe.contentWindow)
            .catch(response => {
            throw response.body;
            });
    }

    /**
     * Play bookmarks: Enter or Exit bookmarks presentation mode.
     *
     * ```javascript
     * // Enter presentation mode.
     * bookmarksManager.play(true)
     * ```
     *
     * @returns {Promise<void>}
     */
    play(playMode: models.BookmarksPlayMode): Promise<void> {
        if (utils.isRDLEmbed(this.config.embedUrl)) {
            return Promise.reject(errors.APINotSupportedForRDLError);
        }

        var playBookmarkRequest: models.IPlayBookmarkRequest = {
            playMode: playMode
        };

        return this.service.hpm.post<models.IError[]>(`/report/bookmarks/play`, playBookmarkRequest, { uid: this.config.uniqueId }, this.iframe.contentWindow)
        .catch(response => {
            throw response.body;
        });
    }

    /**
     * Capture bookmark from current state.
     *
     * ```javascript
     * bookmarksManager.capture()
     * ```
     *
     * @returns {Promise<models.IReportBookmark>}
     */
    capture(): Promise<models.IReportBookmark> {
      if (utils.isRDLEmbed(this.config.embedUrl)) {
          return Promise.reject(errors.APINotSupportedForRDLError);
      }

      return this.service.hpm.post<models.IReportBookmark>(`/report/bookmarks/capture`, null, { uid: this.config.uniqueId }, this.iframe.contentWindow)
        .then(response => response.body,
          response => {
              throw response.body;
          });
    }

    /**
     * Apply bookmark state.
     *
     * ```javascript
     * bookmarksManager.applyState(bookmarkName)
     * ```
     *
     * @returns {Promise<void>}
     */
    applyState(state: string): Promise<void> {
      if (utils.isRDLEmbed(this.config.embedUrl)) {
           return Promise.reject(errors.APINotSupportedForRDLError);
      }

      var request: models.IApplyBookmarkStateRequest = {
          state: state
      };

      return this.service.hpm.post<models.IError[]>(`/report/bookmarks/applyState`, request, { uid: this.config.uniqueId }, this.iframe.contentWindow)
          .catch(response => {
          throw response.body;
          });
    }
}
