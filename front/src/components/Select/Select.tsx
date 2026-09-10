import {useState} from "react";
import {Check, ChevronDown} from "lucide-react";
import useEscapeKey from "../../hooks/useEscapeKey.ts";
import styles from './Select.module.scss'

type SelectOption<T extends string> = {
    value: T
    label: string
}

type SelectProps<T extends string> = {
    value: T
    options: SelectOption<T>[]
    onChange: (value: T) => void
    disabled?: boolean
}

function Select<T extends string>({value, options, onChange, disabled}: SelectProps<T>) {
    const [open, setOpen] = useState(false)
    const current = options.find((option) => option.value === value)

    useEscapeKey(() => setOpen(false), open)

    return (
        <div className={styles.wrapper}>
            <button
                type="button"
                className={styles.trigger}
                disabled={disabled}
                onClick={() => setOpen((prev) => !prev)}
            >
                <span>{current?.label ?? value}</span>
                <ChevronDown size={14} className={styles.chevron}/>
            </button>

            {open && (
                <>
                    <div className={styles.backdrop} onClick={() => setOpen(false)}/>
                    <div className={styles.dropdown}>
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={styles.item}
                                onClick={() => {
                                    onChange(option.value)
                                    setOpen(false)
                                }}
                            >
                                <span>{option.label}</span>
                                {option.value === value && <Check size={14} className={styles.checkIcon}/>}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default Select
