import Icon from '../Icons/icons'   // adjust path as needed
import './textboxunique.css';

interface TextboxUniqueProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    name?: string;
    placeholder?: string;
    className?: string;
    status: 'none' | 'available' | 'taken';
}

export default function TextboxUnique({
    value,
    onChange,
    onBlur,
    name = '',
    placeholder = '',
    className = 'form-control textbox textbox-text textbox-large',
    status
}: TextboxUniqueProps) {
    return (
        <div className="form-element validated-input-wrapper" style={{ position: 'relative' }}>
            <input
                type="text"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                placeholder={placeholder}
                className={className}
            />

            {status !== 'none' && (
                <span
                    style={{
                        position: 'absolute',
                        right: '20px',
                        top: '42%',
                        transform: 'translateY(-50%)'
                    }}
                >
                    {status === 'available' ? (
                        <Icon name="success" width={20} height={20} />
                    ) : (
                        <Icon name="error" width={20} height={20} />
                    )}
                </span>
            )}
        </div>
    );
}
