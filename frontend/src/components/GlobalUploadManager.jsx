import { useUpload } from '../context/UploadContext';

export const GlobalUploadManager = () => {
    const { uploads, removeUpload } = useUpload();
    const uploadList = Object.values(uploads);

    if (uploadList.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 w-80 bg-white shadow-2xl rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 text-white px-4 py-3 text-sm font-semibold flex justify-between items-center">
                <span>Uploading {uploadList.length} video(s)</span>
            </div>

            <div className="max-h-64 overflow-y-auto">
                {uploadList.map(({ spark, file, progress, status, error }) => (
                    <div key={spark._id} className="p-4 border-b border-gray-100 last:border-0">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-900 truncate w-48">{file.name}</span>
                            <span className="text-gray-500">
                                {status === 'error' ? 'Failed' : `${progress}%`}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                            <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${status === 'error' ? 'bg-red-500' : status === 'success' ? 'bg-green-500' : 'bg-orange-500'}`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>

                        {/* Actions / Status Text */}
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500 capitalize">{status}</span>
                            {(status === 'success' || status === 'error') && (
                                <button
                                    onClick={() => removeUpload(spark._id)}
                                    className="text-xs text-gray-900 hover:underline"
                                >
                                    Dismiss
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};