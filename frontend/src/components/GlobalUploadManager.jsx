import { useUpload } from '../context/UploadContext';

export const GlobalUploadManager = () => {
  const { uploads, removeUpload } = useUpload();
  const uploadList = Object.values(uploads);

  if (uploadList.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-80 overflow-hidden rounded-2xl bg-white shadow-modal ring-1 ring-gray-200/80">

      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5 text-orange-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-bold text-white">
            Uploading {uploadList.length} video{uploadList.length > 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-xs font-medium text-gray-400">Background</span>
      </div>

      {/* Upload items */}
      <div className="max-h-56 overflow-y-auto divide-y divide-gray-100">
        {uploadList.map(({ spark, file, progress, status, error }) => (
          <div key={spark._id} className="px-4 py-3">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-semibold text-gray-900 truncate w-48">{file.name}</p>
              <span className={`text-xs font-bold flex-shrink-0 ml-2 ${
                status === 'error' ? 'text-red-500'
                : status === 'success' ? 'text-green-600'
                : 'text-gray-500'
              }`}>
                {status === 'error' ? 'Failed' : status === 'success' ? 'Done' : `${progress}%`}
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  status === 'error' ? 'bg-red-500'
                  : status === 'success' ? 'bg-green-500'
                  : 'bg-orange-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {(status === 'success' || status === 'error') && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400 capitalize">{status === 'success' ? 'Upload complete' : error || 'Upload failed'}</span>
                <button
                  onClick={() => removeUpload(spark._id)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};