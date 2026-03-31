import { Link, useNavigate } from "react-router-dom";
import { isMobileTouchDevice } from '../../../helpers/config';

interface FormFooterLinkProps {
    text: string;
    linkText: string;
    linkUrl: string;
}

export default function FormFooterLink({ text, linkText, linkUrl }: FormFooterLinkProps) {
    const navigate = useNavigate();

    const bottomCardClass = isMobileTouchDevice() ? "mobile-card" : "narrow-card";
    const useCard = !isMobileTouchDevice();

    const cardClassName = useCard ? 'use-card' : 'no-card';
    const borderClassName = useCard ? 'use-border' : 'no-border';

    return (

        <div className="card-top-padding">
            <div className={`${bottomCardClass} ${cardClassName} content-holder-short-card d-block mx-auto row justify-content-center`}>

                <div className="col-12 text-center">{text}</div>
                <div className="col-12 text-center">
                    <div
                        
                        className="footer-link"
                        onClick={() => navigate(linkUrl)}
                        style={{ cursor: "pointer" }}
                    >
                        <span>{linkText}</span>
                    </div>


                </div>
            </div>
        </div>

    );
}
