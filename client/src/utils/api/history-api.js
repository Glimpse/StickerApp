import { request } from '../api';

export function recordStickerView(id) {
    request({
        url: `/history/api/item/${id}`,
        method: 'PUT'
    });
}
