export const ROLE_EVENT_ORGANIZER = 'event_organizer';

export function getEventAdminRole(eventId: string) {
    return 'event_admin_' + eventId;
}
export function getEventViewerRole(eventId: string) {
    return 'event_viewer_' + eventId;
}