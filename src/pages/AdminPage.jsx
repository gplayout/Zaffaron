import React, { useState } from 'react';
import { useRecipes } from '../context/RecipeContext';
import { useToast } from '../hooks/useToast';
import { Download, Plus, Edit, Trash2, Save, X, Search, Upload } from 'lucide-react';
import { categoryMapping } from '../utils/categoryMapping';
import { parseRecipe } from '../utils/dataParser';
import { processImage } from '../utils/imageProcessor';

const AdminPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const { recipes, allRecipes, addRecipe, updateRecipe, deleteRecipe, restoreData } = useRecipes();
    const { addToast } = useToast();
    const [editingRecipe, setEditingRecipe] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('list'); // 'list' or 'form'

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === '1234') {
            setIsAuthenticated(true);
            addToast('خوش آمدید مدیر عزیز');
        } else {
            addToast('رمز عبور اشتباه است', 'error');
        }
    };

    const handleDownloadJSON = () => {
        const dataStr = JSON.stringify(recipes, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'recipes.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        linkElement.click();
        addToast('فایل JSON دانلود شد. لطفا آن را جایگزین فایل اصلی کنید.');
    };

    const handleUploadJSON = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if (restoreData(json)) {
                    addToast('داده‌ها با موفقیت بازگردانی شدند');
                } else {
                    addToast('فرمت فایل نامعتبر است', 'error');
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
                addToast('خطا در خواندن فایل', 'error');
            }
        };
        reader.readAsText(file);
    };

    const handleDelete = (recipe) => {
        if (window.confirm('آیا از حذف این دستور پخت مطمئن هستید؟')) {
            deleteRecipe(recipe.name, recipe.category);
            addToast('دستور پخت حذف شد');
        }
    };

    const handleEdit = (recipe) => {
        setEditingRecipe(recipe);
        setView('form');
    };

    const handleAddNew = () => {
        setEditingRecipe(null);
        setView('form');
    };

    const filteredRecipes = allRecipes.filter(r =>
        r.name.includes(searchTerm) || r.category.includes(searchTerm)
    );

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <form onSubmit={handleLogin} className="glass-panel p-8 rounded-2xl w-full max-w-md text-center">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">ورود به پنل مدیریت</h2>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="رمز عبور"
                        className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20 mb-4 text-center dir-ltr"
                    />
                    <button type="submit" className="w-full btn-primary py-3 rounded-xl">
                        ورود
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center glass-panel p-4 rounded-2xl">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">پنل مدیریت</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            if (window.confirm('آیا مطمئن هستید؟ تمام تغییرات حذف شده و داده‌های اولیه بازگردانده می‌شوند.')) {
                                localStorage.removeItem('app_recipes');
                                window.location.reload();
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors text-sm"
                    >
                        <Trash2 size={18} />
                        <span>بازنشانی</span>
                    </button>
                    <button onClick={handleDownloadJSON} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-sm">
                        <Download size={18} />
                        <span>دانلود JSON</span>
                    </button>
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm cursor-pointer">
                        <Upload size={18} />
                        <span>آپلود JSON</span>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleUploadJSON}
                            className="hidden"
                        />
                    </label>
                    <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm">
                        خروج
                    </button>
                </div>
            </div>

            {view === 'list' ? (
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="جستجو در دستور پخت‌ها..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20"
                            />
                        </div>
                        <button onClick={handleAddNew} className="flex items-center gap-2 btn-primary px-4 py-2 rounded-xl">
                            <Plus size={20} />
                            <span>افزودن دستور پخت جدید</span>
                        </button>
                    </div>



                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-right p-4">عنوان</th>
                                    <th className="text-right p-4">دسته بندی</th>
                                    <th className="text-center p-4">عملیات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecipes.map((recipe, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5">
                                        <td className="p-4">{recipe.name}</td>
                                        <td className="p-4">{recipe.category}</td>
                                        <td className="p-4 flex justify-center gap-2">
                                            <button onClick={() => handleEdit(recipe)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(recipe)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <RecipeForm
                    initialData={editingRecipe}
                    onSave={(data) => {
                        if (editingRecipe) {
                            updateRecipe(editingRecipe, data);
                            addToast('تغییرات ذخیره شد');
                        } else {
                            addRecipe(data);
                            addToast('دستور پخت جدید اضافه شد');
                        }
                        setView('list');
                    }}
                    onCancel={() => setView('list')}
                />
            )
            }
        </div >
    );
};

const RecipeForm = ({ initialData, onSave, onCancel }) => {
    const parsedInitial = initialData ? {
        title: initialData.name,
        category: initialData.category,
        image: initialData.image || '',
        ...parseRecipe(initialData.recipe)
    } : null;

    const [formData, setFormData] = useState(parsedInitial || {
        title: '',
        category: '',
        image: '',
        ingredients: [],
        instructions: []
    });

    const [instructionsText, setInstructionsText] = useState(
        Array.isArray(formData.instructions) ? formData.instructions.join('\n') : formData.instructions
    );

    const [ingredientsText, setIngredientsText] = useState(
        Array.isArray(formData.ingredients) ? formData.ingredients.join('\n') : formData.ingredients
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            instructions: instructionsText.split('\n').filter(line => line.trim() !== ''),
            ingredients: ingredientsText.split('\n').filter(line => line.trim() !== '')
        });
    };

    const categories = Object.keys(categoryMapping);

    return (
        <div className="glass-panel p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{initialData ? 'ویرایش دستور پخت' : 'افزودن دستور پخت جدید'}</h2>
                <button onClick={onCancel} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium">عنوان غذا</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">دسته بندی</label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20"
                        >
                            <option value="">انتخاب کنید</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-medium">آدرس تصویر (اختیاری)</label>
                        <div className="flex flex-col gap-4">
                            <input
                                type="url"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20 dir-ltr text-left"
                            />
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">یا آپلود تصویر:</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            try {
                                                const base64 = await processImage(file);
                                                setFormData({ ...formData, image: base64 });
                                                addToast('تصویر با موفقیت پردازش شد');
                                            } catch (err) {
                                                console.error('Error processing image:', err);
                                                alert('خطا در پردازش تصویر');
                                            }
                                        }
                                    }}
                                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                />
                            </div>
                            {formData.image && (
                                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/20">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: '' })}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium">مواد لازم (هر مورد در یک خط)</label>
                    <textarea
                        rows={6}
                        value={ingredientsText}
                        onChange={(e) => setIngredientsText(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20 font-mono text-sm"
                        placeholder="مثال:&#10;برنج ۳ پیمانه&#10;نمک به مقدار لازم"
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium">طرز تهیه (هر مرحله در یک خط یا به صورت متن پیوسته)</label>
                    <textarea
                        rows={10}
                        value={instructionsText}
                        onChange={(e) => setInstructionsText(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20 leading-relaxed"
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button type="button" onClick={onCancel} className="px-6 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5">
                        انصراف
                    </button>
                    <button type="submit" className="flex items-center gap-2 btn-primary px-8 py-2 rounded-xl">
                        <Save size={20} />
                        <span>ذخیره تغییرات</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminPage;
