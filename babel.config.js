module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [ // ← この行がなければ追加
    'react-native-dotenv' // ← この一行を追加
  ],
};