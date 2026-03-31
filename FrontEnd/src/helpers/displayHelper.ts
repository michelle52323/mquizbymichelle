import { debugLog, debugLogMany, debugAlert, debugAlertMany } from "./debug";

export function getSmartTitleClass(title: string, containerWidth: number): string {
    if (!title) return '';

    const length = title.length;

    //debugLog("Quiz Title", title);
    //debugLog("Quiz Title Length", title.length);

    // debugAlertMany([
    //     { label: "Quiz Title", value: title },
    //     { label: "Quiz Title Length", value: length }
    // ]);


    // Short titles: default styling
    if (length < 23) {
        return '';
    }
    
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Long titles: choose style based on actual container width
    // if (containerWidth > 330 && !isIOS) {
    //     return 'card-title-long-wide-screen';
    // }
    if (!isIOS) {
        return 'card-title-long-wide-screen';
    }

    return 'card-title-long-narrow-screen';
}
