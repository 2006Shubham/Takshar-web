import  { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';

export const EditProfile = ({ isOpen, onClose }) => {
    const { userProfileData, setUserProfileData } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        profileName: userProfileData?.profileName || '',
        role: userProfileData?.role || '',
        organization: userProfileData?.organization || '',
    });

    // Image State
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(userProfileData?.avatarUrl);

    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(userProfileData?.bannerUrl);

    const avatarInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    if (!isOpen) return null;

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        if (type === 'avatar') {
            setAvatarFile(file);
            setAvatarPreview(previewUrl);
        } else {
            setBannerFile(file);
            setBannerPreview(previewUrl);
        }
    };

    const handleTextChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- THE CLOUDINARY UPLOAD HELPER ---
    // Added 'type' parameter to dynamically fetch the correct folder signature
    const uploadImageToCloudinary = async (file, type) => {
        // 1. Get secure signature from your backend with the specific uploadType
        const signRes = await fetch(`http://localhost:5000/api/uploadsignature?uploadType=${type}`, {
            credentials: "include"
        });

        if (!signRes.ok) throw new Error("Failed to authenticate upload.");
        const auth = await signRes.json();

        // 2. Prepare the payload
        const fd = new FormData();
        fd.append("file", file);
        fd.append("timestamp", auth.timestamp);
        fd.append("signature", auth.signature);
        fd.append("api_key", auth.apiKey);

        // Use the dynamically generated folder returned from the backend response
        if (auth.folder) {
            fd.append("folder", auth.folder);
        }

        // 3. Send directly to Cloudinary
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${auth.cloudName}/image/upload`, {
            method: "POST",
            body: fd
        });

        if (!uploadRes.ok) throw new Error("Cloudinary upload failed.");
        const data = await uploadRes.json();

        return data.secure_url; // Return the final public URL
    };


    // --- THE SUBMIT HANDLER ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let finalAvatarUrl = userProfileData.avatarUrl;
            let finalBannerUrl = userProfileData.bannerUrl;

            // 1. Upload images in parallel if both were changed (Massive speed boost)
            const uploadPromises = [];

            if (avatarFile) {
                // Pass 'profile' as the identifier
                uploadPromises.push(
                    uploadImageToCloudinary(avatarFile, 'profile').then(url => { finalAvatarUrl = url; })
                );
            }
            if (bannerFile) {
                // Pass 'banner' as the identifier
                uploadPromises.push(
                    uploadImageToCloudinary(bannerFile, 'banner').then(url => { finalBannerUrl = url; })
                );
            }

            // Wait for any pending uploads to finish
            await Promise.all(uploadPromises);

            // 2. Send all updated data to your backend
            const res = await fetch('http://localhost:5000/api/userprofile/edit', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    profileName: formData.profileName,
                    role: formData.role,
                    organization: formData.organization,
                    profileUrl: finalAvatarUrl,
                    bannerUrl: finalBannerUrl
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update profile");
            }

            // 3. Update the global context instantly
            setUserProfileData(prev => ({
                ...prev,
                profileName: formData.profileName,
                role: formData.role,
                organization: formData.organization,
                avatarUrl: finalAvatarUrl,
                bannerUrl: finalBannerUrl
            }));

            onClose(); // Close the modal on success
        } catch (error) {
            console.error(error);
            alert(error.message || "Failed to update profile. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                    <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Form Body */}
                <div className="overflow-y-auto p-6">
                    <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Banner Edit */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">Banner Image</label>
                            <div
                                className="relative h-24 w-full rounded-xl bg-cover bg-center ring-1 ring-gray-200 group overflow-hidden"
                                style={{ backgroundImage: `url(${bannerPreview})` }}
                            >
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => bannerInputRef.current.click()} className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/30">
                                        Change Banner
                                    </button>
                                </div>
                                <input type="file" accept="image/*" ref={bannerInputRef} className="hidden" onChange={(e) => handleImageChange(e, 'banner')} />
                            </div>
                        </div>

                        {/* Avatar Edit */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">Profile Picture</label>
                            <div className="flex items-center gap-4">
                                <img src={avatarPreview} alt="Preview" className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100" />
                                <button type="button" onClick={() => avatarInputRef.current.click()} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                    Upload New
                                </button>
                                <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={(e) => handleImageChange(e, 'avatar')} />
                            </div>
                        </div>

                        {/* Text Inputs */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Profile Name</label>
                                <input required type="text" name="profileName" value={formData.profileName} onChange={handleTextChange} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-2.5 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Professional Role</label>
                                <input type="text" name="role" value={formData.role} onChange={handleTextChange} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-2.5 border" placeholder="e.g. Full Stack Developer" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Organization</label>
                                <input type="text" name="organization" value={formData.organization} onChange={handleTextChange} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-4 py-2.5 border" placeholder="e.g. COEP Pune" />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" form="edit-profile-form" disabled={isSubmitting} className="rounded-xl bg-orange-600 px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-orange-500 disabled:opacity-50 transition-colors">
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

            </div>
        </div>
    );
};