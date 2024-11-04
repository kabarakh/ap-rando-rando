<script setup lang="ts">
import { filter, map, merge, shuffle, uniq } from 'lodash';
import { parse } from 'yaml';
import { computed, ref, watch } from 'vue';
import { useRepo } from 'pinia-orm';
import Template from '@/models/template';

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

    fileTemplates.forEach(template => {
        const game = template.game;
        templates.value = templatesRepo.save({ options: template[game], game });
    });

};
const numberOfWorlds = ref(4);
const chosenWorlds = ref([]);
const includeStability = ref({
    prod: true,
    beta: true,
    alpha: true,
});
const availableTemplateCount = computed(() => {
  const filtered = filter(templates.value, (template) => {
    return !gameConfigs.value[template.game] || includeStability.value[gameConfigs.value[template.game].state]
  });
  return filtered.length
})

const states = {
    prod: 1,
    alpha: 0.3,
    beta: 0.7,
};

const defaultGameConfigs = {
  'Chrono Trigger Jets of Time': {
    weight: 5,
    state: 'alpha'
  },
  'Spyro 3': {
    weight: 2,
    state: 'alpha'
  },
  'The Legend of Zelda - Oracle of Seasons': {
    weight: 2,
    state: 'alpha'
  },
  'Ocarina of Time': {
    weight: 2,
    state: 'prod'
  },
  'A Link to the Past': {
    weight: 2,
    state: 'prod'
  },
  'Final Fantasy': {
    weight: 2,
    state: 'prod'
  },
  'Links Awakening DX': {
    weight: 10,
    state: 'prod'
  },
  'Timespinner': {
    weight: 5,
    state: 'prod'
  },
  'Mega Man X3': {
    weight: 1,
    state: 'beta'
  },
  'Secret of Evermore': {
    weight: 1,
    state: 'prod'
  },
  'Mega Man X': {
    weight: 1,
    state: 'beta'
  },
  'A Link Between Worlds': {
    weight: 5,
    state: 'alpha'
  },
  'Mega Man X2': {
    weight: 1,
    state: 'beta'
  },
  'The Legend of Zelda - Oracle of Ages': {
    weight: 2,
    state: 'alpha'
  },
};

const changesByDiscord = {
  'FFR': {
    'Links Awakening DX': {
      state: 'beta'
    },
  },
  'JoT': {
    'Chrono Trigger Jets of Time': {
      weight: 100,
      state: 'prod'
    },
  }
}

const chosenDiscord = ref('FFR')

const gameConfigs = computed(() => {
  const localChosenDiscord = chosenDiscord.value;
  return merge({}, defaultGameConfigs, changesByDiscord[localChosenDiscord])
})

const templates = templatesRepo.withAll().get();

watch([chosenDiscord, includeStability, numberOfWorlds], () => {
  chosenWorlds.value = [];
}, {deep: true})

const chooseWorlds = () => {
    const baseFactor = 1000;
    let weightedTemplates = [];
    templates.value.forEach(template => {
        if (gameConfigs.value[template.game]) {
            if (!includeStability.value[gameConfigs.value[template.game].state]) {
                return;
            }
            let factor = baseFactor;
            factor *= gameConfigs.value[template.game].weight;
            factor *= states[gameConfigs.value[template.game].state];

            const newArray = Array(factor).fill(template);
            weightedTemplates = weightedTemplates.concat(newArray);
        } else {
            const newArray = Array(baseFactor).fill(template);
            weightedTemplates = weightedTemplates.concat(newArray);
        }
    });

    const newShuffled = shuffle(weightedTemplates);
    const uniqShuffled = uniq(newShuffled);
    chosenWorlds.value = uniqShuffled.slice(0, numberOfWorlds.value);
};
</script>

<template>
    <button @click.prevent="saveTemplatesFromFiles">
        Save templates from files
    </button>
    <p>{{ templates.length }} yaml template files loaded
      <template v-if="templates.length !== availableTemplateCount">, {{ availableTemplateCount }} available through filter</template>
    </p>
    <form @submit.prevent="chooseWorlds">
      <fieldset>
        Include stability
        <label>
          <input type="checkbox" v-model="includeStability.prod" />
          Prod
        </label>
        <label>
          <input type="checkbox" v-model="includeStability.beta" />
          Beta
        </label>
        <label>
          <input type="checkbox" v-model="includeStability.alpha" />
          Alpha
        </label>
      </fieldset>
      <fieldset>
        Organizing Discord
        <select v-model="chosenDiscord">
          <option value="FFR">FFR</option>
          <option value="JoT">Jets of Time</option>
        </select>
      </fieldset>
        <fieldset>
            <label>
                Number of worlds (1 to {{ availableTemplateCount }})
                <input
                    type="number"
                    min="1"
                    :max="availableTemplateCount"
                    step="1"
                    v-model="numberOfWorlds"
                />
            </label>
        </fieldset>

        <button :disabled="availableTemplateCount === 0" type="submit">Choose random worlds</button>
    </form>
    <ul>
        <li v-for="(template, index) in chosenWorlds" :key="index">
            {{ template.game }} ({{gameConfigs[template.game].state}})
        </li>
    </ul>
</template>
