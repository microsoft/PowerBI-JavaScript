import { Embed, IEmbedOptions, ILoadMessage } from './embed';

export interface IDashboardLoadMessage extends ILoadMessage {
    dashboardId: string
}

export class Dashboard extends Embed {
    static name = "Dashboard";
    
    load(options: IEmbedOptions, requireId: boolean = false) {
        if(requireId && typeof options.id !== 'string') {
            throw new Error(`id must be specified when loading reports on existing elements.`);
        }
        
        const message: IDashboardLoadMessage = {
            action: 'loadDashboard',
            dashboardId: options.id,
            accessToken: null
        };
        
        super.load(options, requireId, message);
    }
}