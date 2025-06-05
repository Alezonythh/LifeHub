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

type Todo = {
  id: number;
  title: string;
  category: string;
  due_date: string;
  is_completed: boolean;
  description: string;
};

const categories = ['Pribadi', 'Kerja', 'Belajar'];

export default function TodoScreen() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Pribadi');
  const [dueDate, setDueDate] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [description, setDescription] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // Filter tanggal
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [showFilterPicker, setShowFilterPicker] = useState(false);

  const api = 'http://10.0.2.2:8000/api/todos';

  const fetchTodos = async () => {
    const res = await axios.get(api);
    setTodos(res.data);
  };

  const handleSubmit = async () => {
    if (title.length < 3 || !dueDate) return;

    if (isEditing && editingId !== null) {
      await axios.put(`${api}/${editingId}`, {
        title,
        category,
        due_date: dueDate,
        is_completed: false,
        description,
      });
      setIsEditing(false);
      setEditingId(null);
    } else {
      await axios.post(api, {
        title,
        category,
        due_date: dueDate,
        is_completed: false,
        description,
      });
    }

    setTitle('');
    setCategory('Pribadi');
    setDueDate('');
    setDescription('');
    fetchTodos();
  };

  const confirmDelete = (id: number) => {
    setPendingDeleteId(id);
    setConfirmVisible(true);
  };

  const deleteTodo = async () => {
    if (pendingDeleteId !== null) {
      await axios.delete(`${api}/${pendingDeleteId}`);
      setConfirmVisible(false);
      setPendingDeleteId(null);
      fetchTodos();
    }
  };

  const toggleComplete = async (item: Todo) => {
    await axios.put(`${api}/${item.id}`, {
      ...item,
      is_completed: !item.is_completed,
    });
    fetchTodos();
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setDueDate(formatted);
      setTempDate(selectedDate);
    }
  };

  const handleFilterDateChange = (event: any, selectedDate?: Date) => {
    setShowFilterPicker(false);
    if (event.type === 'set' && selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setFilterDate(formatted);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const filteredTodos = todos.filter((todo) => {
    const matchCategory = filterCategory === 'Semua' || todo.category === filterCategory;
    const matchDate = !filterDate || todo.due_date === filterDate;
    return matchCategory && matchDate;
  });

  const badgeColor = (cat: string) => {
    switch (cat) {
      case 'Pribadi':
        return 'bg-pink-900 text-pink-200';
      case 'Kerja':
        return 'bg-green-900 text-green-200';
      case 'Belajar':
        return 'bg-yellow-900 text-yellow-200';
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
        <Text style={tw`text-3xl font-extrabold mb-4 text-center text-indigo-300`}>Todo Manager</Text>

        <TextInput
          placeholder="Judul kegiatan"
          value={title}
          onChangeText={setTitle}
          style={tw`border-2 border-indigo-700 rounded-xl px-4 py-3 mb-3 bg-gray-900 text-base text-gray-100`}
          placeholderTextColor="#888"
        />

        <View style={tw`mb-3`}>
          <View style={tw`border border-indigo-700 rounded-xl bg-gray-900`}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              dropdownIconColor="#a5b4fc"
              style={{
                color: '#a5b4fc',
                backgroundColor: '#111827', 
                height: 50,
              }}
              itemStyle={{
                color: '#a5b4fc',
                backgroundColor: '#111827', 
              }}
              mode="dropdown"
            >
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
          <TextInput
            placeholder="Deskripsi (opsional)"
            value={description}
            onChangeText={setDescription}
            style={tw`border-2 border-indigo-700 rounded-xl px-4 py-3 mt-3 bg-gray-900 text-base text-gray-100`}
            placeholderTextColor="#888"
            multiline
            numberOfLines={3}
          />
        </View>

        <Pressable
          onPress={() => setShowPicker(true)}
          style={tw`border-2 border-indigo-700 rounded-xl px-4 py-3 mb-3 bg-gray-900`}
        >
          <Text style={tw.style(dueDate ? 'text-gray-100' : 'text-gray-400', 'text-base')}>
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
              {isEditing ? 'Simpan Perubahan' : 'Tambah Todo'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {isEditing && (
          <TouchableOpacity
            onPress={() => {
              setIsEditing(false);
              setEditingId(null);
              setTitle('');
              setCategory('Pribadi');
              setDueDate('');
              setDescription('');
            }}
            style={tw`bg-gray-700 py-2 mt-3 rounded-xl`}
          >
            <Text style={tw`text-gray-200 text-center font-semibold`}>Batal Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* FILTER */}
      <View style={tw`px-5 mt-6`}>
        <View style={tw`flex-row justify-between mb-2`}>
          {['Semua', ...categories].map((cat) => (
            <TouchableOpacity key={cat} onPress={() => setFilterCategory(cat)}>
              <Text
                style={tw.style(
                  'text-sm font-semibold px-1',
                  filterCategory === cat ? 'text-indigo-400 underline' : 'text-gray-400'
                )}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={tw`flex-row items-center justify-between mb-2`}>
          <TouchableOpacity
            onPress={() => setShowFilterPicker(true)}
            style={tw`bg-indigo-700 px-3 py-2 rounded-lg`}
          >
            <Text style={tw`text-white text-sm`}>📅 Filter Tanggal</Text>
          </TouchableOpacity>

          {filterDate && (
            <TouchableOpacity
              onPress={() => setFilterDate(null)}
              style={tw`bg-gray-700 px-2 py-1 rounded-lg`}
            >
              <Text style={tw`text-gray-200 text-xs`}>❌ Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {showFilterPicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleFilterDateChange}
            themeVariant="dark"
          />
        )}
      </View>

      <FlatList
        data={filteredTodos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={tw`px-5 pt-4 pb-10`}
        ListEmptyComponent={<Text style={tw`text-gray-500 text-center mt-10`}>Belum ada todo</Text>}
        renderItem={({ item }) => (
          <View
            style={tw.style(
              'flex-row items-center bg-gray-800 rounded-2xl p-4 mb-3 shadow-lg',
              item.is_completed && 'opacity-60'
            )}
          >
            <CheckBox
              value={item.is_completed}
              onValueChange={() => toggleComplete(item)}
              color={item.is_completed ? '#22c55e' : '#71717a'}
              style={tw`scale-125`}
            />
            <View style={tw`flex-1 ml-4`}>
              <Text
                style={[
                  tw`text-lg font-semibold`,
                  item.is_completed ? tw`line-through text-gray-500` : tw`text-gray-100`,
                ]}
              >
                {item.title}
              </Text>
              <Text style={tw`text-xs text-gray-400 mt-1`}>{item.description}</Text>
              <View style={tw`flex-row items-center mt-1`}>
                <Text style={tw.style('text-xs mr-2 px-2 py-0.5 rounded-full', badgeColor(item.category))}>
                  {item.category}
                </Text>
                <TouchableOpacity onPress={() => setFilterDate(item.due_date)}>
                  <Text style={tw`text-xs text-indigo-300 underline`}>📅 {item.due_date}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                setIsEditing(true);
                setEditingId(item.id);
                setTitle(item.title);
                setCategory(item.category);
                setDueDate(item.due_date);
                setDescription(item.description);
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
            <Text style={tw`text-white text-lg font-semibold text-center mb-4`}>
              Yakin ingin menghapus todo ini?
            </Text>
            <View style={tw`flex-row justify-around`}>
              <TouchableOpacity onPress={() => setConfirmVisible(false)} style={tw`px-4 py-2 bg-gray-600 rounded-xl`}>
                <Text style={tw`text-white font-semibold`}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteTodo} style={tw`px-4 py-2 bg-red-600 rounded-xl`}>
                <Text style={tw`text-white font-semibold`}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
