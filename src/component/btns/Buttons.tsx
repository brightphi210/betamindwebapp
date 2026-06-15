import { FiArrowRight } from "react-icons/fi";


interface ButtonsProps {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
}
export const SolidGreenButtons = (props: ButtonsProps) => {
    return (
        <div>
            <button
                className="w-full cursor-pointer py-3.5 rounded-lg text-white font-bold text-sm hover:opacity-90 active:opacity-75 mb-4 bg-[#010C06]"
                onClick={props.onClick}
                disabled={props.disabled}
            >
                {props.text}
            </button>
        </div>
    )
}

export default SolidGreenButtons


export const SoliGreenButtonsArrow = (props: ButtonsProps) => {
    return (
        <div>
            <button
                className="bg-[#010C06] text-[#ffffff] px-5 sm:px-6 py-2.5 rounded-md text-sm sm:text-sm font-medium flex items-center gap-2 hover:opacity-90 transition"
                onClick={props.onClick}
                disabled={props.disabled}
            >
                <span>{props.text}</span>
                <FiArrowRight size={18} />
            </button>
        </div>
    )
}