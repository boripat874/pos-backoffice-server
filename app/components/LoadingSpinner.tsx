// components/LoadingSpinner.js
export default function LoadingSpinner() {
    return (
      <div className="w-[90vw] h-screen m-auto flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-8 border-b-8 border-[#3EB776]"></div>
      </div>
    );
}