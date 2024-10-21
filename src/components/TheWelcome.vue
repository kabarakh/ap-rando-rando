<script setup lang="ts">
import { chain, map, random, shuffle, uniq } from 'lodash';
import { parse } from 'yaml';
import { ref } from 'vue';
import { useRepo } from 'pinia-orm'
import Template from '@/models/template'

const templatesRepo = useRepo(Template);

const saveTemplatesFromFiles = () => {
  const templateFiles = import.meta.glob('@/assets/templates/*.yaml', {
    query: '?raw',
    import: 'default',
    eager: true,
  });

  const fileTemplates = map(templateFiles, module => {
    return parse(module);
  });

  fileTemplates.forEach((template) => {
    templatesRepo.save({content: template})
  })
}

const numberOfWorlds = ref(4);
const chosenWorlds = ref([]);

const templates = templatesRepo.all();

const chooseWorlds = () => {
  const newTemplates = [];
  const randomCount = random(200, 300);
  const newArray = Array(randomCount).fill(templates[0]);
  const randomCount2 = random(10, 30);
  const newArray2 = Array(randomCount2).fill(templates[1]);
   const concatArray = newTemplates.concat(templates, newArray, newArray2)
  console.log(concatArray)
  const newShuffled = shuffle(concatArray)
    const uniqShuffled = uniq(newShuffled)
console.log(newShuffled, uniqShuffled, uniqShuffled.slice(0, numberOfWorlds.value))

    const shuffled = shuffle(templates);
    chosenWorlds.value = shuffled.slice(0, numberOfWorlds.value);
};
</script>

<template>
  <button @click.prevent="saveTemplatesFromFiles">Save templates from files</button>
    <p>{{ templates.length }} yaml template files loaded</p>
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
            {{ template.content.game }}
        </li>
    </ul>
</template>
