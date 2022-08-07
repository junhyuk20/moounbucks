// localStorage에 저장 형식은 key, value 형식이며  value는 무조건 문자열로 저장해야 된다.
const store = {
  setLocalStorage(menu) {
    localStorage.setItem("menu", JSON.stringify(menu));
  },
  getLocalStorage() {
    return JSON.parse(localStorage.getItem("menu"));
  },
};

export default store;
