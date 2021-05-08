brew services list
echo "0:データベース起動": 
echo "1:データベース停止": 
read str 
if [ ${str} = 0 ]; then
  brew services start mongodb-community
  echo "データベース起動"
elif [ ${str} = 1 ]; then
  brew services stop mongodb-community
  echo "データベース停止"
else
  echo "処理失敗"
fi
