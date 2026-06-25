import React from 'react';
import './feedbackbanner.css';

import successIcon from '../../../assets/icons/success-standard-filled-svgrepo-com.svg';
import failureIcon from '../../../assets/icons/namur-failure-filled-svgrepo-com.svg';

interface FeedbackBannerProps {
    message: string;
    onClose?: () => void;
}

function FeedbackBanner({ message, onClose }: FeedbackBannerProps) {

    if (!message) return null;

    const isSuccess = message.toLowerCase().includes('successful');

    const positionClass = isSuccess
        ? 'feedback-banner-bottom'
        : 'feedback-banner-top';

    const bannerClass = `feedback-banner ${positionClass} ${isSuccess ? 'feedback-banner-success' : 'feedback-banner-error'
        }`;


    const iconHref = isSuccess ? successIcon : failureIcon;

    return (
        <div id="feedback-banner" className={bannerClass}>
            <div className="feedback-icon">
                <img
                    src={iconHref}
                    alt={isSuccess ? 'Success Icon' : 'Failure Icon'}
                    width="20"
                    height="20"
                />
            </div>
            <div className="feedback-banner-message">{message}</div>

            {onClose && (
                <button
                    type="button"
                    className="feedback-banner-close"
                    onClick={onClose}
                    aria-label="Close notification"
                >
                   ×
                </button>
            )}
        </div>
    );

}

export default FeedbackBanner;