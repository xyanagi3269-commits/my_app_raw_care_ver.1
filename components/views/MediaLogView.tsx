import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useLawnCare } from '../../context/LawnCareContext';
import Card from '../ui/Card';
import { PhotoIcon, VideoCameraIcon, PlusIcon, XMarkIcon, PencilIcon, TrashIcon, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { MediaLog } from '../../types';

const MediaRenderer: React.FC<{ log: MediaLog }> = ({ log }) => {
    if (log.mediaType === 'image') {
        return <img src={log.mediaUrl} alt={log.note || '芝生のメディア'} className="w-full h-48 object-cover rounded-t-xl" />;
    }
    if (log.mediaType === 'video') {
        return <video src={log.mediaUrl} controls className="w-full h-48 object-cover rounded-t-xl bg-black" />;
    }
    return null;
}

const MediaLogCard: React.FC<{ log: MediaLog }> = ({ log }) => {
    const { updateMediaLog, deleteMediaLog, toggleMediaLogLike } = useLawnCare();
    const [isEditing, setIsEditing] = useState(false);
    const [note, setNote] = useState(log.note);
    const [tags, setTags] = useState(log.tags.join(', '));

    const handleSave = () => {
        const updatedLog: MediaLog = {
            ...log,
            note,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        };
        updateMediaLog(updatedLog);
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm('このログを本当に削除しますか？')) {
            deleteMediaLog(log.id);
        }
    };

    if (isEditing) {
        return (
            <Card className="p-0">
                <MediaRenderer log={log} />
                <div className="p-4 space-y-4">
                    <div>
                        <label htmlFor={`note-${log.id}`} className="block text-sm font-medium text-gray-700">メモ</label>
                        <textarea id={`note-${log.id}`} value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2"></textarea>
                    </div>
                    <div>
                        <label htmlFor={`tags-${log.id}`} className="block text-sm font-medium text-gray-700">タグ</label>
                        <input type="text" id={`tags-${log.id}`} value={tags} onChange={(e) => setTags(e.target.value)} className="block w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-sm p-3" placeholder="例: 問題, 乾燥" />
                        <p className="mt-1 text-xs text-gray-500">タグはカンマ区切りで入力してください。</p>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => setIsEditing(false)} className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300">キャンセル</button>
                        <button onClick={handleSave} className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">保存</button>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-0">
            <MediaRenderer log={log} />
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-500">{log.date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div className="flex gap-1">
                        <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-gray-100 transition-colors"><PencilIcon className="h-5 w-5" /></button>
                        <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"><TrashIcon className="h-5 w-5" /></button>
                    </div>
                </div>
                <p className="text-gray-700 mb-3 whitespace-pre-wrap break-words">{log.note}</p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                        {log.tags.length > 0 && log.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <button 
                        onClick={() => toggleMediaLogLike(log.id)} 
                        className="flex items-center gap-1 text-gray-500 hover:text-red-500 rounded-full p-1.5 hover:bg-red-50 transition-colors"
                        aria-label={log.liked ? 'いいねを取り消す' : 'いいね'}
                    >
                        {log.liked 
                            ? <HeartIconSolid className="h-6 w-6 text-red-500" /> 
                            : <HeartIconOutline className="h-6 w-6" />
                        }
                    </button>
                </div>
            </div>
        </Card>
    );
};


const MediaLogView: React.FC = () => {
    const { mediaLogs, addMediaLog } = useLawnCare();
    const [showForm, setShowForm] = useState(false);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [note, setNote] = useState('');
    const [tags, setTags] = useState('');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            if (file.type.startsWith('image/')) {
                setMediaType('image');
            } else if (file.type.startsWith('video/')) {
                setMediaType('video');
            } else {
                setMediaType(null);
            }
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!mediaPreview || !mediaType) {
            alert('画像または動画ファイルを選択してください。');
            return;
        }
        addMediaLog({
            mediaUrl: mediaPreview,
            mediaType,
            note,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
        });
        // Reset form
        setShowForm(false);
        setMediaPreview(null);
        setMediaType(null);
        setNote('');
        setTags('');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-700">メディアログ</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors duration-200"
                >
                    {showForm ? <XMarkIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                    <span>{showForm ? 'キャンセル' : 'メディアを追加'}</span>
                </button>
            </div>

            {showForm && (
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="media-upload" className="block text-sm font-medium text-gray-700 mb-1">写真または動画</label>
                            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                                <div className="space-y-1 text-center">
                                    {!mediaPreview && <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />}
                                    {mediaType === 'image' && mediaPreview && <img src={mediaPreview} alt="プレビュー" className="mx-auto h-24 w-auto rounded-lg" />}
                                    {mediaType === 'video' && mediaPreview && (
                                        <div className="mx-auto flex flex-col items-center">
                                            <VideoCameraIcon className="h-12 w-12 text-gray-400" />
                                            <span className="text-sm text-gray-500 mt-1">動画を選択しました</span>
                                        </div>
                                    )}
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label htmlFor="media-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-green-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 hover:text-green-500">
                                            <span>ファイルをアップロード</span>
                                            <input id="media-upload" name="media-upload" type="file" className="sr-only" accept="image/*,video/*" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, MP4など</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="note" className="block text-sm font-medium text-gray-700">メモ</label>
                            <textarea id="note" name="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2"></textarea>
                        </div>
                        
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">タグ</label>
                            <input type="text" name="tags" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="block w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-sm p-3" placeholder="例: 問題, 乾燥, 成長記録" />
                            <p className="mt-1 text-xs text-gray-500">タグはカンマ区切りで入力してください。</p>
                        </div>

                        <div className="flex justify-end pt-2">
                             <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">
                                ログを保存
                             </button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="space-y-4">
                {mediaLogs.map(log => (
                   <MediaLogCard key={log.id} log={log} />
                ))}
            </div>
        </div>
    );
};

export default MediaLogView;