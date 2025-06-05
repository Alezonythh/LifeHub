import axios from "axios";
import React, { useState, useEffect } from "react";
import { FlatList, Image, Text, View, Modal, TouchableOpacity, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

const placeholderImg = "https://via.placeholder.com/400x200?text=No+Image";

type Article = {
  author?: string;
  title?: string;
  url: string;
  description?: string;
  urlToImage?: string;
  content?: string;
  publishedAt?: string;
};

const shuffleArray = (array: Article[]) => {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
};

const Explore = () => {
  const [artikel, setArtikel] = useState<Article[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const getBerita = async () => {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=us&apiKey=08a2e66c7c114f138b6e60707f745c83`
      );
      const shuffled = shuffleArray(response.data.articles);
      setArtikel(shuffled);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getBerita();
  }, []);

  const openModal = (item: Article) => {
    setSelectedArticle(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedArticle(null);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-950`}>
      <View style={tw`mb-2`}>
        <Text style={tw`text-3xl font-extrabold p-6 text-white tracking-wide`}>
          Berita Terkini
        </Text>
      </View>
      <FlatList
        data={artikel}
        keyExtractor={(item) => item.url || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-4`}
        renderItem={({ item }) => (
          <View
            style={tw`p-4 bg-gray-800 rounded-2xl shadow-2xl mx-4 my-3 border border-gray-700`}
          >
            <View style={tw`h-48 rounded-2xl overflow-hidden mb-3 bg-gray-700`}>
              <Image
                source={{ uri: item.urlToImage || placeholderImg }}
                style={tw`w-full h-full`}
                resizeMode="cover"
              />
            </View>
            <View style={tw`px-1`}>
              <Text style={tw`font-bold text-lg mb-2 text-white leading-6`}>
                {item.title}
              </Text>
              <Text style={tw`text-gray-300 mb-3 leading-5 text-base`}>
                {item.description}
              </Text>
              {item.author && (
                <Text style={tw`text-gray-400 text-xs font-medium mb-1`}>
                  By {item.author}
                </Text>
              )}
              <TouchableOpacity
                onPress={() => openModal(item)}
                style={tw`mt-2 bg-blue-600 rounded-lg py-2 px-4 self-start shadow-lg`}
                activeOpacity={0.8}
              >
                <Text style={tw`text-white text-sm font-semibold`}>
                  Read More
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal for detail */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={tw`flex-1 bg-black/80 justify-center items-center`}>
          <View style={tw`bg-gray-900 rounded-2xl w-11/12 max-h-[85%] shadow-2xl overflow-hidden`}>
            <ScrollView contentContainerStyle={tw`p-5`}>
              <View style={tw`rounded-2xl overflow-hidden mb-3 bg-gray-700`}>
                <Image
                  source={{ uri: selectedArticle?.urlToImage || placeholderImg }}
                  style={tw`w-full h-48`}
                  resizeMode="cover"
                />
              </View>
              <Text style={tw`font-bold text-xl mb-2 text-white`}>
                {selectedArticle?.title || 'Judul tidak tersedia'}
              </Text>
              {selectedArticle?.author && (
                <Text style={tw`text-gray-400 text-sm mb-1`}>
                  Oleh {selectedArticle.author}
                </Text>
              )}
              {selectedArticle?.publishedAt && (
                <Text style={tw`text-gray-500 text-xs mb-3`}>
                  {new Date(selectedArticle.publishedAt).toLocaleString()}
                </Text>
              )}
              <Text style={tw`text-gray-300 mb-3 text-base leading-6`}>
                {selectedArticle?.description || 'Deskripsi tidak tersedia.'}
              </Text>
              <Text style={tw`text-gray-200 mb-4 text-sm leading-6`}>
                {selectedArticle?.content || 'Konten lengkap tidak tersedia untuk berita ini.'}
              </Text>
              {selectedArticle?.url && (
                <TouchableOpacity
                  onPress={() => {
                    Linking.openURL(selectedArticle.url);
                  }}
                  style={tw`mb-4 bg-indigo-600 rounded-lg py-2 px-4 shadow-lg`}
                >
                  <Text style={tw`text-white text-center text-base font-semibold`}>
                    Buka Sumber Asli 🔗
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={closeModal}
                style={tw`bg-red-600 rounded-lg py-2 shadow-lg`}
                activeOpacity={0.8}
              >
                <Text style={tw`text-white text-center font-bold text-base`}>Tutup</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Explore;
