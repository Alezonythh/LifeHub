import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    FlatList,
    Modal,
    Pressable,
    Platform,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CheckBox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import tw from 'twrnc';

type Mood = {
    id: number;
    title: string;
    category: string;
    due_date: string;
    is_completed: boolean;
};

const moodCategories = [
    { label: 'Senang', emoji: '😊' },
    { label: 'Sedih', emoji: '😢' },
    { label: 'Stress', emoji: '😣' },
];

const getCategoryEmoji = (category: string) => {
    const found = moodCategories.find((cat) => cat.label === category);
    return found ? found.emoji : '';
};

export default function MoodScreen() {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Senang');
    const [dueDate, setDueDate] = useState('');
    const [moods, setMoods] = useState<Mood[]>([]);
    const [showPicker, setShowPicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [filterCategory, setFilterCategory] = useState('Semua');

    const [confirmVisible, setConfirmVisible] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    const api = 'http://10.0.2.2:8000/api/moods';

    const fetchMoods = async () => {
        const res = await axios.get(api);
        setMoods(res.data);
    };

    const handleSubmit = async () => {
        if (title.length < 3 || !dueDate) return;

        if (isEditing && editingId !== null) {
            await axios.put(`${api}/${editingId}`, {
                title,
                category,
                due_date: dueDate,
                is_completed: false,
            });
            setIsEditing(false);
            setEditingId(null);
        } else {
            await axios.post(api, {
                title,
                category,
                due_date: dueDate,
                is_completed: false,
            });
        }

        setTitle('');
        setCategory('Senang');
        setDueDate('');
        fetchMoods();
    };

    const confirmDelete = (id: number) => {
        setPendingDeleteId(id);
        setConfirmVisible(true);
    };

    const deleteMood = async () => {
        if (pendingDeleteId !== null) {
            await axios.delete(`${api}/${pendingDeleteId}`);
            setConfirmVisible(false);
            setPendingDeleteId(null);
            fetchMoods();
        }
    };

    const toggleComplete = async (item: Mood) => {
        await axios.put(`${api}/${item.id}`, {
            ...item,
            is_completed: !item.is_completed,
        });
        fetchMoods();
    };

    const handleDateChange = (_event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate) {
            const formatted = selectedDate.toISOString().split('T')[0];
            setDueDate(formatted);
            setTempDate(selectedDate);
        }
    };

    useEffect(() => {
        fetchMoods();
    }, []);

    const filteredMoods =
        filterCategory === 'Semua'
            ? moods
            : moods.filter((mood) => mood.category === filterCategory);

    const badgeColor = (cat: string) => {
        switch (cat) {
            case 'Senang':
                return 'bg-yellow-900 text-yellow-200';
            case 'Sedih':
                return 'bg-blue-900 text-blue-200';
            case 'Stress':
                return 'bg-red-900 text-red-200';
            default:
                return 'bg-gray-800 text-gray-200';
        }
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-gray-900 pt-[${StatusBar.currentHeight || 0}px]`}>
            <View style={tw`h-36 w-full absolute top-0 left-0 right-0 z-0`}>
                <LinearGradient
                    colors={['#1e293b', '#6366f1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={tw`flex-1 rounded-b-3xl`}
                />
            </View>

            <View style={tw`z-10 bg-gray-800 mx-4 mt-6 p-5 rounded-3xl shadow-lg`}>
                <Text style={tw`text-3xl font-extrabold mb-4 text-center text-indigo-300`}>Mood Manager</Text>

                <TextInput
                    placeholder="Catatan mood"
                    value={title}
                    onChangeText={setTitle}
                    style={tw`border-2 border-indigo-700 rounded-xl px-4 py-3 mb-3 bg-gray-900 text-base text-gray-100`}
                    placeholderTextColor="#888"
                />

                {/* KATEGORI MOOD */}
                <View style={tw`mb-3`}>
                    <View style={tw`border border-indigo-700 rounded-xl bg-gray-900`}>
                        <Picker
                            selectedValue={category}
                            onValueChange={(itemValue) => setCategory(itemValue)}
                            dropdownIconColor="#a5b4fc"
                            style={{
                                color: '#a5b4fc',
                                backgroundColor: '#1e293b',
                                height: 50,
                                fontSize: 16,
                            }}
                            itemStyle={{
                                color: '#a5b4fc',
                                backgroundColor: '#1e293b',
                                fontSize: 16,
                                height: 44,
                            }}
                            mode="dropdown"
                        >
                            {moodCategories.map((cat) => (
                                <Picker.Item
                                    key={cat.label}
                                    label={`${cat.emoji} ${cat.label}`}
                                    value={cat.label}
                                    color="#a5b4fc"
                                    style={{
                                        backgroundColor: '#1e293b',
                                        fontSize: 16,
                                    }}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* TANGGAL */}
                <Pressable
                    onPress={() => setShowPicker(true)}
                    style={tw`border-2 border-indigo-700 rounded-xl px-4 py-3 mb-3 bg-gray-900`}
                >
                    <Text style={tw`${dueDate ? 'text-gray-100' : 'text-gray-400'} text-base`}>
                        {dueDate || 'Pilih Tanggal'}
                    </Text>
                </Pressable>

                {showPicker && (
                    <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        themeVariant="dark"
                    />
                )}

                <LinearGradient colors={['#4338ca', '#a21caf']} style={tw`rounded-xl mt-1`}>
                    <TouchableOpacity onPress={handleSubmit} style={tw`py-3 rounded-xl items-center`} activeOpacity={0.85}>
                        <Text style={tw`text-white font-bold text-base tracking-wide`}>
                            {isEditing ? 'Simpan Perubahan' : 'Tambah Mood'}
                        </Text>
                    </TouchableOpacity>
                </LinearGradient>

                {isEditing && (
                    <TouchableOpacity
                        onPress={() => {
                            setIsEditing(false);
                            setEditingId(null);
                            setTitle('');
                            setCategory('Senang');
                            setDueDate('');
                        }}
                        style={tw`bg-gray-700 py-2 mt-3 rounded-xl`}
                    >
                        <Text style={tw`text-gray-200 text-center font-semibold`}>Batal Edit</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={tw`px-5 mt-6`}>
                <View style={tw`border-b border-gray-700 mb-2`} />
                <View style={tw`flex-row justify-between`}>
                    {['Semua', ...moodCategories.map((cat) => cat.label)].map((cat) => {
                        const emoji = cat === 'Semua' ? '🕸️' : getCategoryEmoji(cat);
                        return (
                            <TouchableOpacity key={cat} onPress={() => setFilterCategory(cat)}>
                                <Text style={tw.style('text-sm font-semibold px-1', filterCategory === cat ? 'text-indigo-400 underline' : 'text-gray-400')}>
                                    {emoji} {cat}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <View style={tw`border-b border-gray-700 mt-2`} />
            </View>

            <FlatList
                data={filteredMoods}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={tw`px-5 pt-4 pb-10`}
                ListEmptyComponent={<Text style={tw`text-gray-500 text-center mt-10`}>Belum ada mood</Text>}
                renderItem={({ item }) => (
                    <View style={tw.style('flex-row items-center bg-gray-800 rounded-2xl p-4 mb-3 shadow-lg', item.is_completed && 'opacity-60')}>
                        <CheckBox
                            value={item.is_completed}
                            onValueChange={() => toggleComplete(item)}
                            color={item.is_completed ? '#22c55e' : '#71717a'}
                            style={tw`scale-125`}
                        />
                        <View style={tw`flex-1 ml-4`}>
                            <Text style={[tw`text-lg font-semibold`, item.is_completed ? tw`line-through text-gray-500` : tw`text-gray-100`]}>
                                {item.title}
                            </Text>
                            <View style={tw`flex-row items-center mt-1`}>
                                <Text style={tw`text-xs mr-2 px-2 py-0.5 rounded-full ${badgeColor(item.category)}`}>
                                    {getCategoryEmoji(item.category)} {item.category}
                                </Text>
                                <Text style={tw`text-xs text-gray-400`}>📅 {item.due_date}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setIsEditing(true);
                                setEditingId(item.id);
                                setTitle(item.title);
                                setCategory(item.category);
                                setDueDate(item.due_date);
                            }}
                            style={tw`ml-2 px-2 py-1 rounded-xl bg-indigo-900`}
                        >
                            <Text style={tw`text-indigo-300 text-xs`}>✏️ Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => confirmDelete(item.id)} style={tw`ml-2 px-2 py-1 rounded-xl bg-red-900`}>
                            <Text style={tw`text-red-300 text-xs`}>🗑️ Hapus</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            <Modal visible={confirmVisible} transparent animationType="fade">
                <View style={tw`flex-1 bg-black bg-opacity-50 justify-center items-center px-10`}>
                    <View style={tw`bg-gray-800 rounded-2xl p-6 w-full`}>
                        <Text style={tw`text-white text-lg font-semibold text-center mb-4`}>Yakin ingin menghapus mood ini?</Text>
                        <View style={tw`flex-row justify-around`}>
                            <TouchableOpacity onPress={() => setConfirmVisible(false)} style={tw`px-4 py-2 bg-gray-600 rounded-xl`}>
                                <Text style={tw`text-white font-semibold`}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={deleteMood} style={tw`px-4 py-2 bg-red-600 rounded-xl`}>
                                <Text style={tw`text-white font-semibold`}>Hapus</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
