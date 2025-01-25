<template>
  <aside class="px-2 h-full flex flex-col pt-2">
    <nav class="flex-1">
      <ol class="flex flex-col gap-1">
        <li
          v-for="menu in MENUS"
          :key="menu.name"
          class="flex flex-col items-center justify-center aspect-square w-16 h-16 relative overflow-hidden rounded-xl p-2 transition select-none"
          :class="{
            'bg-gray-700 [&>*]:text-primary': menu.selected,
            'hover:bg-gray-800': !menu.selected,
          }"
          role="button"
          @click="redirectMenu(menu)"
        >
          <TransitionGroup name="active-menu" appear>
            <i class="uil text-2xl" :class="menu.icon"></i>
            <span v-if="!menu.selected" class="text-xs text-center">{{
              menu.name
            }}</span>
          </TransitionGroup>
          <Transition name="active-menu-bar" appear>
            <div
              v-if="menu.selected"
              class="absolute left-0 top-0 h-full w-1 bg-primary"
            />
          </Transition>
        </li>
      </ol>
    </nav>
    <div class="mt-auto">
      <button
        class="flex flex-col items-center justify-center aspect-square w-auto h-16 relative overflow-hidden rounded-xl p-2 transition select-none hover:bg-gray-800 mb-2"
        @click="toggleMinimizeData"
      >
        <i class="uil text-2xl uil-arrows-h-alt" />
      </button>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useSidebarStore } from "../stores/sidebarStore";

const { toggleMinimizeData } = useSidebarStore();

interface Menu {
  name: string;
  icon: string;
  path: string;
  selected?: boolean;
}

const router = useRouter();

const MENUS = computed(() => {
  let menus: Menu[] = [
    {
      name: "Inicio",
      icon: "uil-home",
      path: "home",
    },
    {
      name: "Plano",
      icon: "uil-plane-fly",
      path: "flight-plan",
    },
    {
      name: "Cartas",
      icon: "uil-location-arrow",
      path: "charts",
    },
  ];

  menus = menus.map((menu) => {
    if (router.currentRoute.value.name?.toString().includes(menu.path)) {
      menu.selected = true;
    } else {
      menu.selected = false;
    }

    return menu;
  });

  return menus;
});

function redirectMenu(menu: Menu) {
  router.push({ name: menu.path });
}
</script>

<style scoped>
.active-menu-move,
.active-menu-enter-active,
.active-menu-leave-active {
  transition: all 0.5s ease;
}
.active-menu-enter-from,
.active-menu-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.active-menu-leave-active {
  position: absolute;
}

.active-menu-bar-enter-active,
.active-menu-bar-leave-active {
  transition: all 0.3s ease;
}
.active-menu-bar-enter-from,
.active-menu-bar-leave-to {
  transform: translateX(-30px);
}
</style>
