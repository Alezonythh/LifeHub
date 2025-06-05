import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import axios from 'axios';
import tw from 'twrnc';
import { SafeAreaView } from 'react-native-safe-area-context';

type TriviaItem = {
    question: string;
    correct_answer: string;
};

export default function TriviaScreen() {
    const [data, setData] = useState<TriviaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<string[]>([]);
    const [score, setScore] = useState<number | null>(null);

    const fetchData = () => {
        setLoading(true);
        setScore(null);
        axios.get('https://opentdb.com/api.php?amount=5')
            .then(res => {
                setData(res.data.results);
                setAnswers(Array(res.data.results.length).fill(''));
            })
            .catch(() => setData([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAnswerChange = (text: string, index: number) => {
        const newAnswers = [...answers];
        newAnswers[index] = text;
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        let newScore = 0;
        data.forEach((item, idx) => {
            if (
                answers[idx]?.trim().toLowerCase() ===
                decodeURIComponent(item.correct_answer).trim().toLowerCase()
            ) {
                newScore += 1;
            }
        });
        setScore(newScore);
        Keyboard.dismiss();
    };

    const handleReset = () => {
        setScore(null);
        setAnswers(Array(data.length).fill(''));
    };

    if (loading) {
        return (
            <SafeAreaView style={tw`flex-1 bg-black`}>
                <View style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" color="#60a5fa" />
                    <Text style={tw`text-white mt-4`}>Memuat soal...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={tw`flex-1 bg-black`}>
            <Text style={tw`text-3xl font-extrabold mt-6 mb-2 text-center text-[#6366f1]`}>Trivia Quiz</Text>
            <Text style={tw`text-base text-center text-gray-200 mb-4`}>Jawab pertanyaan berikut!</Text>
            <FlatList
                data={data}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item, index }) => (
                    <View style={tw`p-4 bg-[#222] rounded-2xl mx-4 mb-3 shadow-lg shadow-black`}>
                        <Text style={tw`font-bold mb-2 text-base text-white`}>
                            {decodeURIComponent(item.question)}
                        </Text>
                        <TextInput
                            style={tw`border border-[#6366f1] rounded-xl px-3 py-2 mt-2 bg-black text-white`}
                            placeholder="Tulis jawaban Anda di sini..."
                            placeholderTextColor="#6366f1"
                            value={answers[index]}
                            editable={score === null}
                            onChangeText={text => handleAnswerChange(text, index)}
                            returnKeyType="done"
                        />
                        {score !== null && (
                            <Text style={tw`text-gray-200 mt-2`}>
                                Jawaban benar: <Text style={tw`text-[#6366f1]`}>{decodeURIComponent(item.correct_answer)}</Text>
                            </Text>
                        )}
                    </View>
                )}
            />
            {score === null ? (
                <TouchableOpacity
                    style={tw`mx-4 my-4 bg-[#6366f1] rounded-xl py-3 shadow-lg active:bg-[#4f46e5]`}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                >
                    <Text style={tw`text-center text-lg font-bold text-white`}>Kirim Jawaban</Text>
                </TouchableOpacity>
            ) : (
                <View style={tw`mx-4 my-4`}>
                    <Text style={tw`text-xl font-bold text-center mb-2 text-green-400`}>
                        Skor Anda: {score} / {data.length}
                    </Text>
                    <TouchableOpacity
                        style={tw`bg-[#6366f1] rounded-xl py-3 shadow-lg active:bg-[#4f46e5]`}
                        onPress={handleReset}
                        activeOpacity={0.8}
                    >
                        <Text style={tw`text-center text-lg font-bold text-white`}>Ulangi Jawaban</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={tw`bg-[#a21caf] rounded-xl py-3 mt-3 shadow-lg active:bg-[#7e22ce]`}
                        onPress={fetchData}
                        activeOpacity={0.8}
                    >
                        <Text style={tw`text-center text-base font-bold text-white`}>Muat Soal Baru</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
