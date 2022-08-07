// step2 요구사항 구현을 위한 전략

// TODO localStorage Read & Write
// -[x] localStorage에 데이터를 저장한다.
// -[x] 메뉴를 추가할 때
// -[x] 메뉴를 수정할 때
// -[x] 메뉴를 삭제할 때
// -[X] localStorag에 있는 데이터를 읽어온다.

// TODO 카테고리별 메뉴판 관리
// -[x] 에스프레소 메뉴판 관리
// -[x] 프라푸치노 메뉴판 관리
// -[x] 블레디드 메뉴판 관리
// -[x] 티바나 메뉴판 관리
// -[x] 디저트 메뉴판 관리

// TODO 페이지 접근시 최초 데이터 Read & Rendering
// -[x] 페이지에 최초로 로딩될때 localStorage에 에스프레소 메뉴를 읽어온다.
// -[x] 에스프레소 메뉴를 페이지에 그려준다.

// TODO 품질 상태 관리
// -[] 품절 상태인 경우를 보여줄 수 있게, 품절 버튼을 추가하고 sold-out class를 추가하여 상태를 변경한다.
// -[] 품절 버튼을 버튼을 추가한다.
// -[] 품절 버튼을 클릭하면 localStorage에 상태값이 저장된다.
// -[] 클릭이벤트에서 가장가까운 li태그의 class속성 값에 sold-out을 추가한다.

const $ = (selector) => document.querySelector(selector);

// localStorage에 저장 형식은 key, value 형식이며  value는 무조건 문자열로 저장해야 된다.
const store = {
  setLocalStorage(menu) {
    localStorage.setItem("menu", JSON.stringify(menu));
  },
  getLocalStorage() {
    return JSON.parse(localStorage.getItem("menu"));
  },
};

function App() {
  // 상태는 변하는 데이터, 이 앱에서 변하는 것이 무엇인가? - 메뉴명, 개수(이녀석은 너무 간단해서 제외 해도 된다.) 즉 상태를 관리해야 되는 녀석들은 저장되거나,변하거나 이다.
  this.menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    desert: [],
  };
  //카테고리 메뉴선택 시, 상태관리 해주는 녀석 처음화면은 espresso 카테고리로 고정
  this.currentCategory = "espresso";
  this.init = () => {
    if (store.getLocalStorage()) {
      this.menu = store.getLocalStorage();
    }
    render();
  };
  //추가한 메뉴 그려주는 녀석
  const render = () => {
    const template = this.menu[this.currentCategory]
      .map((menuItem, index) => {
        return `
        <li data-menu-id=${index} class="menu-list-item d-flex items-center py-2">
            <span class="w-100 pl-2 menu-name">${menuItem.name}</span>
            <button
              type="button"
              class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
            >
              수정
            </button>
            <button
              type="button"
              class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
            >
              삭제
            </button>
          </li>
        `;
      })
      .join(""); //insertAdjacentHTML 대체용 join 메서드 알아보기

    $("#menu-list").innerHTML = template;

    // 추가된 메뉴가 몇개인지 파악후 화면에 표출하기
    updateMenuCount();
  };
  const updateMenuCount = () => {
    const menuCount = $("#menu-list").querySelectorAll("li").length;
    $(".menu-count").innerText = `총 ${menuCount} 개`;
  };
  const addMenuName = () => {
    if ($("#menu-name").value === "") {
      alert("값을 입력해 주세요.");
      return;
    }
    const menuName = $("#menu-name").value;
    this.menu[this.currentCategory].push({ name: menuName });
    store.setLocalStorage(this.menu[this.currentCategory]);

    render();

    // 메뉴를 추가 후 입력란 초기화
    $("#menu-name").value = "";
  };
  const updateMenuName = (e) => {
    const menuId = e.target.closest("li").dataset.menuId; // jQuery .data() 메서드와 동일한 메서드 dataset
    const menuName = e.target.closest("li").querySelector(".menu-name");
    const updatedMenuName = prompt("메뉴명을 수정하세요", menuName.innerText);
    this.menu[this.currentCategory][menuId].name = updatedMenuName;
    store.setLocalStorage(this.menu);
    menuName.innerText = updatedMenuName;
  };
  const removeMenuName = (e) => {
    if (confirm(`정말 삭제하시겠습니까?`)) {
      const menuId = e.target.closest("li").dataset.menuId;
      this.menu[this.currentCategory].splice(menuId, 1); // 배열에서 요소 삭제할 떄
      store.setLocalStorage(this.menu); // 로컬스토리지 업뎃
      e.target.closest("li").remove();
      updateMenuCount();
    }
  };

  $("#menu-list").addEventListener("click", (e) => {
    //수정 버튼 클릭시
    if (e.target.classList.contains("menu-edit-button")) {
      updateMenuName(e);
    }
    //삭제 버튼 클릭시
    if (e.target.classList.contains("menu-remove-button")) {
      removeMenuName(e);
    }
  });

  //엔터키를 눌렀을 때 form 태그가 자동으로 전송되는걸 막아준다.
  $("#menu-form").addEventListener("submit", (e) => {
    e.preventDefault();
  });

  // 마우스로 확인버튼 클릭했을 때, 이부분 제로초 고급강좌 첫번째 보자
  $("#menu-submit-button").addEventListener("click", addMenuName);

  // 메뉴의 이름을 입력받는 곳
  $("#menu-name").addEventListener("keypress", (e) => {
    if (e.key !== "Enter") return;
    addMenuName();
  });
  $("nav").addEventListener("click", (e) => {
    const isCategoryButton = e.target.classList.contains("cafe-category-name"); // 결괏값 true , false
    if (isCategoryButton) {
      const categoryName = e.target.dataset.categoryName;
      this.currentCategory = categoryName;
      $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
      render();
    }
  });
}
//App();
const app = new App();
app.init();
