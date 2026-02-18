'use client'

interface ModalProps {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    className?: string; // Allow passing custom classes for the modal dialog
}
 
export default function Modal({ title, children, isOpen, onClose, className }: ModalProps) {
    return (
        isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[101]">
                <div className={`bg-white rounded-lg shadow-lg  ${className || 'h-[800px]'}`}>
                    <h2 className="text-md xl:text-xl mb-4 bg-[#84bd00] text-white p-4 rounded-t-lg">
                        {title}
                        <button className="float-right text-gray-300" onClick={onClose}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </h2>
                    <div className="px-4 pb-3">
                        {children}
                    </div>
                </div>
            </div>
        )
    )
}