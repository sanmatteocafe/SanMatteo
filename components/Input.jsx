import styles from './Input.module.css';

export default function Input({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    required = false,
    error,
    icon,
    className = '',
    ...props
}) {
    return (
        <div className={`${styles.inputGroup} ${className}`}>
            {label && <label className={styles.label}>{label}{required && <span className={styles.required}>*</span>}</label>}
            <div className={styles.inputWrapper}>
                {icon && <span className={styles.icon}>{icon}</span>}
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={`${styles.input} ${icon ? styles.withIcon : ''} ${error ? styles.hasError : ''}`}
                    {...props}
                />
            </div>
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}
