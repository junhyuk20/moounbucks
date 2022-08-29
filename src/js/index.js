import { $ } from "./utils/dom.js";
import store from "./store/index.js";
/*
step 3 요구사항
 - [] 웹 서버를 띄운다.
 - [] 서버에 새로운 메뉴가 추가될 수 있도록 요청한다.
 - [] 서버에 카테고리별 메뉴리스트를 불러온다.
 - [] 서버에 메뉴가 수정 될 수 있도록 요청한다.
 - [] 서버에 메뉴의 품절상태가 토글링 될 수 있도록 요청한다.
 - [] 서버에 메뉴가 삭제 될 수 있도록 요청한다.
 
 TODO 리팩터링 부분
 - [] localStorage에 저장하는 로직은 지운다.
 - [] fetch 비동기 api를 사용하는 부분을 async await를 사용하여 구현한다.
 
 TODO 사용자 경험
 - [] API 통신이 실패하는 경우에 대해 사용자가 알 수 있게 alert으로 예외처리를 진행한다.
 - [] 중복되는 메뉴는 추가할 수 없다.
*/

const BASE_URL = "http://localhost:3000/api";

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

  // App 객체를 처음 초기화 시켜주는 녀석
  this.init = () => {
    // 로컬스토리지 값 있으면
    if (store.getLocalStorage()) {
      this.menu = store.getLocalStorage();
    }
    render();
    initEventListeners();
  };

  //추가한 메뉴 그려주는 녀석
  const render = () => {
    const template = this.menu[this.currentCategory]
      .map((menuItem, index) => {
        return `
        <li data-menu-id=${index} class="menu-list-item d-flex items-center py-2">
            <span class=" ${
              menuItem.soldOut ? "sold-out" : ""
            } w-100 pl-2 menu-name">${menuItem.name}</span>
              <button
                type="button"
                class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
              >
                품절
              </button>
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
    const menuCount = this.menu[this.currentCategory].length;
    $(".menu-count").innerText = `총 ${menuCount} 개`;
  };
  const addMenuName = () => {
    if ($("#menu-name").value === "") {
      alert("값을 입력해 주세요.");
      return;
    }
    const menuName = $("#menu-name").value;
    fetch(`${BASE_URL}/category/${this.currentCategory}/menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: menuName }),
    })
      .then((response) => {
        return response.json(); //응답 데이터를 받으려면 json() 메서드를 사용해서 받아야 된다.
      })
      .then((res) => {
        console.log(res);
      });

    //this.menu[this.currentCategory].push({ name: menuName });
    //store.setLocalStorage(this.menu[this.currentCategory]);
    //render();

    // 메뉴를 추가 후 입력란 초기화
    //$("#menu-name").value = "";
  };
  const updateMenuName = (e) => {
    const menuId = e.target.closest("li").dataset.menuId; // jQuery .data() 메서드와 동일한 메서드 dataset
    const menuName = e.target.closest("li").querySelector(".menu-name");
    const updatedMenuName = prompt("메뉴명을 수정하세요", menuName.innerText); //프롬프트에서 사용자가 작성한 내용이 들어감
    this.menu[this.currentCategory][menuId].name = updatedMenuName;
    store.setLocalStorage(this.menu);
    render();
  };
  const removeMenuName = (e) => {
    if (confirm(`정말 삭제하시겠습니까?`)) {
      const menuId = e.target.closest("li").dataset.menuId;
      this.menu[this.currentCategory].splice(menuId, 1); // 배열에서 요소 삭제할 떄
      store.setLocalStorage(this.menu); // 로컬스토리지 업뎃
      e.target.closest("li").remove();
      render();
    }
  };
  const soldOutMenu = (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    this.menu[this.currentCategory][menuId].soldOut =
      !this.menu[this.currentCategory][menuId].soldOut; // toggle버튼 처럼
    store.setLocalStorage(this.menu);
    render();
  };
  const initEventListeners = () => {
    $("#menu-list").addEventListener("click", (e) => {
      //수정 버튼 클릭시
      if (e.target.classList.contains("menu-edit-button")) {
        updateMenuName(e);
        return; // 해당 if문만 돌고 끝내기
      }
      //삭제 버튼 클릭시
      if (e.target.classList.contains("menu-remove-button")) {
        removeMenuName(e);
        return;
      }
      //품절 버튼 클릭시
      if (e.target.classList.contains("menu-sold-out-button")) {
        soldOutMenu(e);
        return;
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
    //메뉴 카테고리 클릭시
    $("nav").addEventListener("click", (e) => {
      const isCategoryButton =
        e.target.classList.contains("cafe-category-name"); // 결괏값 true , false
      if (isCategoryButton) {
        const categoryName = e.target.dataset.categoryName;
        this.currentCategory = categoryName;
        $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
        render();
      }
    });
  };
}

const app = new App();
app.init();
