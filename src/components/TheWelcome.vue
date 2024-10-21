<script setup lang="ts">
import { map, shuffle } from 'lodash';
import { parse } from 'yaml';
import { ref } from 'vue';
import { useRepo } from 'pinia-orm'
import Template from '@/models/template'

const templatesRepo = useRepo(Template);

const saveTemplatesFromFiles = () => {
  templates.forEach((template) => {
    templatesRepo.save({content: template})
  })
}

const templateFiles = import.meta.glob('@/assets/templates/*.yaml', {
    query: '?raw',
    import: 'default',
    eager: true,
});

const templates = map(templateFiles, module => {
    return parse(module);
});

const numberOfWorlds = ref(4);
const chosenWorlds = ref([]);

const chooseWorlds = () => {
    const shuffled = shuffle(templates);
    chosenWorlds.value = shuffled.slice(0, numberOfWorlds.value);
};
</script>

<template>
  <button @click.prevent="saveTemplatesFromFiles">Save templates from files</button>
    <p>{{ templatesRepo.all().length }} yaml template files loaded</p>
    <form @submit.prevent="chooseWorlds">
        <input
            type="number"
            min="1"
            :max="templates.length"
            step="1"
            v-model="numberOfWorlds"
        />
        <button type="submit">Choose random worlds</button>
    </form>
    <ul>
        <li v-for="(template, index) in chosenWorlds" :key="index">
            {{ template.game }}
        </li>
    </ul>
</template>
