// VueデバッグツールON
Vue.config.devtools = true;

/** LocalStorageへデータ保存 */
const STORAGE_KEY = "my-todos";
var storage = {
  fetch() {
    let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    // IDを振り直す
    todos.forEach((todo, index) => {
      todo.id = index;
      todo.edit = false;
    });
    storage.uid = todos.length;

    // IDの降順にソート
    todos.sort((a, b) => {
      return b.id - a.id;
    });

    return todos;
  },
  save(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  },
  incrementUid() {
    return storage.uid++;
  }
};

/** ToDoリストアイテム */
Vue.component("todo-item", {
  props: ["todo"],
  template: `<div class="todo-list-item">
    <input
      type="checkbox"
      name="todo"
      :value="todo.id"
      v-model="todo.done"
    />
    <input
      v-if="todo.edit"
      type="text"
      name="todo_title"
      v-model="todo.title"
      @change="changed"
      @blur="changed"
    />
    <label v-else for="todo" @click="edit">
      {{ todo.title }}
    </label >
    <button class="button_remove" v-if="todo.edit" @click="remove">
      <i class="material-icons md-18">clear</i>
    </button>
  </div>`,
  methods: {
    edit() {
      this.todo.edit = true;
    },
    changed() {
      this.todo.edit = false;
    },
    remove() {
      this.$emit("remove");
    }
  }
});

/** タブ */
Vue.component("todo-tabs", {
  template: `
    <div>
      <div class="tabs">
        <div v-for="(tab, index) in tabs"
          class="tab"
          :class="{ selected: isSelected(tab) }"
          @click="changeTab(tab)">
          {{ tab }}
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      tabs: ["All", "Active", "Completed"],
      selectedTab: "All"
    };
  },
  methods: {
    isSelected(tab) {
      return this.selectedTab === tab;
    },
    changeTab(tab) {
      this.selectedTab = tab;
      this.$emit("change", tab);
    }
  }
});

/** Vue app定義 */
var app = new Vue({
  el: "#app",
  props: {
    title: {
      type: String,
      required: true
    }
  },
  data: {
    todos: storage.fetch(),
    activeTab: "All"
  },
  methods: {
    addToDoList() {
      // TODOを登録する
      let todo = {
        id: storage.incrementUid(),
        title: this.title,
        done: false,
        edit: false
      };
      this.todos.unshift(todo);

      // 入力した内容を空にする
      this.title = null;
    },
    removeToDo(todo) {
      const index = this.todos.findIndex(item => item.id === todo.id);
      this.todos.splice(index, 1);
    },
    changeTab(event) {
      this.activeTab = event;
    }
  },
  computed: {
    allTodos() {
      return this.todos;
    },
    activeTodos() {
      return this.todos.filter(todo => todo.done === false);
    },
    completedTodos() {
      return this.todos.filter(todo => todo.done === true);
    }
  },
  watch: {
    todos: {
      handler(newTodos, oldTodos) {
        storage.save(newTodos);
      },
      deep: true
    }
  }
});
