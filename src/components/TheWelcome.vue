<script setup lang="ts">
import { filter, find, map, merge, shuffle, uniq } from 'lodash';
import { parse } from 'yaml';
import { computed, type Ref, ref, watch } from 'vue';
import database from '@/stores/templates';
import { useObservable } from '@vueuse/rxjs';
import { liveQuery } from 'dexie';
import { computedAsync } from '@vueuse/core';


const saveTemplatesFromFiles = () => {
  const templateFiles = import.meta.glob('@/assets/templates/*.yaml', {
    query: '?raw',
    import: 'default',
    eager: true
  });

  const fileTemplates = map(templateFiles, module => {
    return parse(module);
  });

  fileTemplates.forEach(template => {
    const game = template.game;
    database.addTemplate({
      game: game,
      options: template[game]
    });
  });

  const defaultGameConfigs = [
    {
      game: 'Chrono Trigger Jets of Time',
      weight: 5,
      state: 'alpha'
    },
    {
      game: 'Spyro 3',
      weight: 2,
      state: 'alpha'
    },
    {
      game: 'The Legend of Zelda - Oracle of Seasons',
      weight: 2,
      state: 'alpha'
    },
    {
      game: 'Ocarina of Time',
      weight: 2,
      state: 'stable'
    },
    {
      game: 'A Link to the Past',
      weight: 2,
      state: 'stable'
    },
    {
      game: 'Final Fantasy',
      weight: 2,
      state: 'stable'
    },
    {
      game: 'Links Awakening DX',
      weight: 10,
      state: 'stable'
    },
    {
      game: 'Timespinner',
      weight: 5,
      state: 'stable'
    },
    {
      game: 'Mega Man X3',
      weight: 1,
      state: 'beta'
    },
    {
      game: 'Secret of Evermore',
      weight: 1,
      state: 'stable'
    },
    {
      game: 'Mega Man X',
      weight: 1,
      state: 'beta'
    },
    {
      game: 'A Link Between Worlds',
      weight: 5,
      state: 'alpha'
    },
    {
      game: 'Mega Man X2',
      weight: 1,
      state: 'beta'
    },
    {
      game: 'The Legend of Zelda - Oracle of Ages',
      weight: 2,
      state: 'alpha'
    }
  ];

  defaultGameConfigs.forEach((gameConfig) => {
    database.addGameConfig(gameConfig)
  })
};
const numberOfWorlds = ref(4);
const chosenWorlds = ref([]);
const includeStability = ref({
  stable: true,
  beta: true,
  alpha: true
});
const availableTemplateCount = computed(() => {
  const filtered = filter(templates.value, template => {
    const gameConfig = find(gameConfigs.value, {game: template.game})
    return (
      !gameConfig ||
      includeStability.value[gameConfig.state]
    );
  });
  return filtered.length;
});

const guaranteedGames: Ref<string[]> = ref([])

const states = {
  stable: 1,
  alpha: 0.3,
  beta: 0.7
};

const changesByDiscord = {
  FFR: {
    'Links Awakening DX': {
      state: 'beta'
    }
  },
  JoT: {
    'Chrono Trigger Jets of Time': {
      weight: 100,
      state: 'stable'
    }
  }
};

const chosenDiscord = ref('FFR');

const defaultTemplates = useObservable(liveQuery(database.getAllGameConfigs));

const gameConfigs = computedAsync(async () => {
  const localChosenDiscord = chosenDiscord.value;
  const gameConfigs = defaultTemplates.value;
  return map(gameConfigs, (gameConfig) => {
    return merge({}, gameConfig, changesByDiscord[localChosenDiscord][gameConfig.game])
  });
});

const templates = useObservable(liveQuery(database.getAllTemplates))
watch(
  [chosenDiscord, includeStability, numberOfWorlds],
  () => {
    chosenWorlds.value = [];
  },
  { deep: true }
);

watch(
  [guaranteedGames],
  () => {
    if (guaranteedGames.value.length > numberOfWorlds.value) {
      numberOfWorlds.value = guaranteedGames.value.length
    }
  }
)

const chooseWorlds = () => {
  const baseFactor = 1000;
  let weightedTemplates = [];
  templates.value.forEach(template => {
    const gameConfig = find((gameConfigs.value), {game: template.game});
    if (gameConfig) {
      if (
        !includeStability.value[gameConfig.state]
      ) {
        return;
      }
      let factor = baseFactor;
      factor *= gameConfig.weight;
      factor *= states[gameConfig.state];

      const newArray = Array(factor).fill(template);
      weightedTemplates = weightedTemplates.concat(newArray);
    } else {
      const newArray = Array(baseFactor).fill(template);
      weightedTemplates = weightedTemplates.concat(newArray);
    }
  });

  const newShuffled = shuffle(weightedTemplates);
  const guaranteedTemplates = filter(templates.value, (template) => {
    return guaranteedGames.value.includes(template.game)
  });
  const withGuaranteed = guaranteedTemplates.concat(newShuffled);
  const uniqShuffled = uniq(withGuaranteed);
  chosenWorlds.value = uniqShuffled.slice(0, numberOfWorlds.value);
};

const resetGuaranteed = () => {
  guaranteedGames.value = [];
}
</script>

<template>
    <button @click.prevent="saveTemplatesFromFiles">
        Save templates from files
    </button>
    <p>
        {{ templates?.length }} yaml template files loaded
        <template v-if="templates?.length !== availableTemplateCount"
            >, {{ availableTemplateCount }} available through filter
        </template>
    </p>
    <form @submit.prevent="chooseWorlds">
        <fieldset>
            Include stability
            <label>
                <input type="checkbox" v-model="includeStability.stable" />
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
                Number of worlds ({{ guaranteedGames.length || 1 }} to {{ availableTemplateCount }})
                <input
                    type="number"
                    :min="guaranteedGames.length || 1"
                    :max="availableTemplateCount"
                    step="1"
                    v-model="numberOfWorlds"
                />
            </label>
        </fieldset>
      <fieldset>
        <label>
          Guaranteed games (overwrites stability!)<br/>
          <select v-model="guaranteedGames" multiple :style="{
            resize: 'vertical'
          }">
            <option :key="template.game" v-for="template in templates" :value="template.game">{{template.game}}</option>
          </select>
          <button @click.prevent="resetGuaranteed">Reset guaranteed games</button>
        </label>
      </fieldset>

        <button :disabled="availableTemplateCount === 0" type="submit">
            Choose random worlds
        </button>
    </form>
    <ul>
        <li v-for="(template, index) in chosenWorlds" :key="index">
            {{ template.game }} ({{ find(gameConfigs, {game: template.game}).state }})
        </li>
    </ul>
</template>
