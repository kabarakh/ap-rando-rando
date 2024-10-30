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
    const game = template.game;
    templatesRepo.save({options: template[game], game})
  })
}
const numberOfWorlds = ref(4);
const chosenWorlds = ref([]);

const states = {
  prod: 1,
  alpha: 0.5,
  beta: 0.75
}

const gameConfigs = {
  'A Link Between Worlds': {
    names: [
      'KabaBetweenWorlds',
      'KabaALBW',
      'KabarakhALBW',
      'KabaZelda3DS'
    ],
    state: 'alpha',
    weight: 5,
  },
  'Links Awakening DX': {
    names: [
      'KabaLADXRakh',
      'KabarakhDX',
      'KabarakhAwakening'
    ],
    state: 'beta',
    weight: 10
  },
  'Chrono Trigger Jets of Time': {
    names: [
      'KabaOfTime',
      'KabarakhCT',
      'KabarakhJoT'
    ],
    state: 'beta',
    weight: 2
  },
  'A Link to the Past': {
    names: [],
    state: 'prod',
    weight: 1
  }
}

const templates = templatesRepo.all();

const chooseWorlds = () => {
  const baseFactor = 1000;
  let weightedTemplates = [];
  templates.forEach(template => {
    if (gameConfigs[template.game]) {
      let factor = baseFactor
      factor *= gameConfigs[template.game].weight;
      factor *= states[gameConfigs[template.game].state]

      const newArray = Array(factor).fill(template);
      weightedTemplates = weightedTemplates.concat(newArray);
    } else {
      const newArray = Array(baseFactor).fill(template);
      weightedTemplates = weightedTemplates.concat(newArray);
    }
  })

  const newShuffled = shuffle(weightedTemplates)
  const uniqShuffled = uniq(newShuffled)
  chosenWorlds.value = uniqShuffled.slice(0, numberOfWorlds.value);
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
            {{ template.game }}
        </li>
    </ul>
</template>
