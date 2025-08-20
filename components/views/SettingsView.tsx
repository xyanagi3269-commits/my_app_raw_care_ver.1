
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useLawnCare } from '../../context/LawnCareContext';
import Card from '../ui/Card';
import { LawnProfile, Fertilizer, Wages } from '../../types';

const SettingsView: React.FC = () => {
  const { profile, fertilizers, wages, updateProfile, updateFertilizer, updateWages } = useLawnCare();
  const [localProfile, setLocalProfile] = useState<LawnProfile>(profile);
  const [localFertilizer, setLocalFertilizer] = useState<Fertilizer>(fertilizers[0]);
  const [localWages, setLocalWages] = useState<Wages>(wages);
  const [saved, setSaved] = useState(false);
  
  const handleProfileChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalProfile(prev => ({ ...prev, [name]: parseFloat(value) || value }));
  };

  const handleFertilizerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFertilizer(prev => ({...prev, [name]: name === 'name' ? value : parseFloat(value) || value }));
  };
  
  const handleWagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalWages(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateProfile(localProfile);
    updateFertilizer(localFertilizer);
    updateWages(localWages);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  const InputField: React.FC<{ label: string, name: string, type: string, value: string | number, onChange: (e: ChangeEvent<HTMLInputElement>) => void, unit?: string, min?: number, max?: number, step?: number }> = ({ label, name, type, value, onChange, unit, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <input
                type={type}
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                className="block w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-sm p-3"
                {...props}
            />
            {unit && <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-gray-500 sm:text-sm">{unit}</span></div>}
        </div>
    </div>
  );
  
  const SelectField: React.FC<{ label: string, name: string, value: string, onChange: (e: ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode }> = ({ label, name, value, onChange, children }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <select id={name} name={name} value={value} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 py-3 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm">
        {children}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700">芝生プロファイル</h2>
      <Card>
        <div className="space-y-4">
          <InputField label="芝生の面積" name="area" type="number" value={localProfile.area} onChange={handleProfileChange} unit="m²" />
          <InputField label="目標の刈り高" name="targetHeight" type="number" value={localProfile.targetHeight} onChange={handleProfileChange} unit="mm" />
          <SelectField label="芝の種類" name="grassType" value={localProfile.grassType} onChange={handleProfileChange}>
            <option value="Bermuda">バミューダグラス</option>
            <option value="Zoysia">高麗芝</option>
            <option value="StAugustine">セントオーガスチングラス</option>
            <option value="Fescue">フェスク</option>
          </SelectField>
          <InputField label="散水率" name="irrigationRate" type="number" value={localProfile.irrigationRate} onChange={handleProfileChange} unit="L/分" />
        </div>
      </Card>
      
      <h2 className="text-xl font-bold text-gray-700">肥料プロファイル</h2>
       <Card>
         <div className="space-y-4">
          <InputField label="肥料名" name="name" type="text" value={localFertilizer.name} onChange={handleFertilizerChange} />
          <InputField label="窒素(N)含有量" name="nitrogenPercentage" type="number" value={localFertilizer.nitrogenPercentage} onChange={handleFertilizerChange} unit="%" min={0} max={50} step={0.1}/>
         </div>
      </Card>
      
      <h2 className="text-xl font-bold text-gray-700">人件費設定</h2>
      <Card>
        <div className="space-y-4">
          <InputField label="父の時給" name="father" type="number" value={localWages.father} onChange={handleWagesChange} unit="円/時間" />
          <InputField label="母の時給" name="mother" type="number" value={localWages.mother} onChange={handleWagesChange} unit="円/時間" />
          <InputField label="子の時給" name="child" type="number" value={localWages.child} onChange={handleWagesChange} unit="円/時間" />
        </div>
      </Card>

      <button type="submit" className="w-full rounded-md bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors duration-200">
        {saved ? '保存しました！' : '設定を保存'}
      </button>
    </form>
  );
};

export default SettingsView;
