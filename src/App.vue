<template>
  <div id="app">
    <div style="height: 800px; width: 1200px; border: 1px solid red; position: relative;margin: 0 auto">
      <vue-draggable-resizable
        @deactivated="onDeactivated" @activated="onActivated"
        @dragging="computeRule"
        :w="200" :h="200" :parent="true" :debug="false" :min-width="200" :min-height="200"
        :snap="true" :snapTolerance="1" @refLineParams="getRefLineParams" class="test1 ruleEl">
      </vue-draggable-resizable>
      <vue-draggable-resizable
        @deactivated="onDeactivated" @activated="onActivated"
        @dragging="computeRule"
        :w="200" :h="200" :parent="true"
        :x="210" :debug="false" :min-width="200" :min-height="200" :snap="true" :snapTolerance="1"
        @refLineParams="getRefLineParams" class="test2 ruleEl">
      </vue-draggable-resizable>
      <vue-draggable-resizable
        @deactivated="onDeactivated" @activated="onActivated"
        @dragging="computeRule"
        :w="200" :h="200" :parent="true" :x="420" :debug="false"
        :min-width="200" :min-height="200" :snap="true" :snapTolerance="1" @refLineParams="getRefLineParams"
        class="test3 ruleEl">
      </vue-draggable-resizable>
      <!--辅助线-->
      <span class="ref-line v-line" v-for="item in vLine" :key="item.id" v-show="item.display"
        :style="{ left: item.position, top: item.origin, height: item.lineLength}" />
      <span class="ref-line h-line" v-for="item in hLine" :key="item.id" v-show="item.display"
        :style="{ top: item.position, left: item.origin, width: item.lineLength}" />
      <span class="" />
      <!--辅助线END-->
      <!-- 距离辅助线 -->
      <span class="ref-line v-line text-center" v-for="item in ruleLines.ruleVLine" :key="item.id"
        :style="{ left: item.left + 'px', top: item.top + 'px', height: item.lineLength + 'px'}" >{{item.lineLength}}</span>
      <span class="ref-line h-line text-center" v-for="item in ruleLines.ruleHLine" :key="item.id"
        :style="{ top: item.top + 'px', left: item.left + 'px', width: item.lineLength + 'px'}" >{{item.lineLength}}</span>
      <span class="" />
      <!-- 虚线 -->
      <span style="border-left: 1px dashed blue;width: 0;background-color: transparent;" class="ref-line v-line text-center" v-for="item in ruleLines.dashedVLine" :key="item.id"
        :style="{ left: item.left + 'px', top: item.top + 'px', height: item.lineLength + 'px'}" />
      <span style="border-top: 1px dashed blue;height: 0;background-color: transparent;" class="ref-line h-line text-center" v-for="item in ruleLines.dashedHLine" :key="item.id"
        :style="{ top: item.top + 'px', left: item.left + 'px', width: item.lineLength + 'px'}" />
      <!-- 间距线 -->
      <span class="ref-line v-line text-center" v-for="item in gapLines.gapVLine" :key="item.id"
        :style="{ left: item.left + 'px', top: item.top + 'px', height: item.lineLength + 'px'}" >{{item.lineLength}}</span>
      <span class="ref-line h-line text-center" v-for="item in gapLines.gapHLine" :key="item.id"
        :style="{ top: item.top + 'px', left: item.left + 'px', width: item.lineLength + 'px'}" >{{item.lineLength}}</span>
      <span class="" />
    </div>
  </div>
</template>

<script>
import { h } from 'vue'
import VueDraggableResizable from './components/vue-draggable-resizable'
import './components/vue-draggable-resizable.css'
import GenLine from './generate-lines'

const { ActiveElMapLinesManager, LinesOfTwoRelatedEl } = GenLine

const lineManager = new ActiveElMapLinesManager()

export default {
  name: 'app',
  components: {
    VueDraggableResizable
  },
  data () {
    return {
      vLine: [],
      hLine: [],
      activeEl: null,
      ruleLines: new LinesOfTwoRelatedEl(),
      gapLines: {
        gapHLine: [],
        gapVLine: []
      }
    }
  },
  methods: {
    computeRule (x, y, e) {
      const allEls = [...document.getElementsByClassName('ruleEl')]
      lineManager.computeGapLines(allEls)
      const mostCloseGapLines = lineManager.getMostCloseGapLineOfEl(this.activeEl, allEls)
      const gapValue = Math.min(
        mostCloseGapLines.gapHLine ? mostCloseGapLines.gapHLine.lineLength : Infinity,
        mostCloseGapLines.gapVLine ? mostCloseGapLines.gapVLine.lineLength : Infinity
      )
      if (Number.isFinite(gapValue)) {
        lineManager.getMatchedGaps(gapValue, allEls).then((ret) => {
          this.gapLines.gapHLine = ret.gapHLine.filter(line => !!line)
          this.gapLines.gapVLine = ret.gapVLine.filter(line => !!line)
        })
      } else {
        this.gapLines.gapHLine = []
        this.gapLines.gapVLine = []
      }
    },
    onDeactivated () {
      this.activeEl = null
      this.gapLines.gapHLine = []
      this.gapLines.gapVLine = []
    },
    onActivated (activeEl) {
      this.activeEl = activeEl
    },
    // 辅助线回调事件
    getRefLineParams (params) {
      const { vLine, hLine } = params
      let id = 0
      this.vLine = vLine.map(item => {
        item['id'] = ++id
        return item
      })
      this.hLine = hLine.map(item => {
        item['id'] = ++id
        return item
      })
    }
  }
}
</script>

<style>
.test1 {
  background-color: rgb(239, 154, 154);
}

.test2 {
  background-color: rgb(129, 212, 250);
}

.test3 {
  background-color: rgb(174, 213, 129);
}
</style>
