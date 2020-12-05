<!--
    VWinResizer

    Used by VWindow for resizing.
-->

<template>
    <div :class="'winresize '+type + (enabled?'':'disabled')"
        v-on:mousedown="startdrag"
    ></div>
</template>

<script>

export default {
    name: 'VWinResizer',
    props: {
        type: {
            default: 'top'
        },
        value: {
            type: Number
        },
        min: {},
        max: {},
        enabled: {
            default: true
        }
    }, 
    methods:{
        startdrag: function(e){
            e.stopImmediatePropagation();
            e.preventDefault();
            if(!this.enabled){
                return;
            }
            this.val = this.value;
            this.dragoffset.x = e.screenX;
            this.dragoffset.y = e.screenY;
            this.emit('resizing' );
            document.getElementsByTagName('body')[0].addEventListener('mousemove', this.drag )
            document.getElementsByTagName('body')[0].addEventListener('mouseup', this.enddrag )
        },
        enddrag: function(e){
            document.getElementsByTagName('body')[0].removeEventListener('mousemove', this.drag);
            document.getElementsByTagName('body')[0].removeEventListener('mouseup', this.enddrag )
            this.emit('resized' );
        },
        drag: function(e){
            let v;
            switch (this.type){
                case 'left':
                    v = this.val + ( e.screenX - this.dragoffset.x );
                    break;
                case 'right':
                    v = this.val + ( e.screenX - this.dragoffset.x );
                    break;
                case 'top':
                    v = this.val + ( e.screenY - this.dragoffset.y );
                    break;
                case 'bottom':
                    v = this.val + ( e.screenY - this.dragoffset.y );
                    break;
            }
            if(this.min){
                v = Math.max(this.min, v);
            }
            if(this.max){
                v = Math.min(this.max, v);
            }
            if(this.val != v){
                let offs = this.val-this.value;
                if(this.emit('resize', offs )){
                    this.dragoffset.x = e.screenX;
                    this.dragoffset.y = e.screenY;
                    this.val = v;
                }
            }
        },
        emit: function(etype, offs){
            let e = {
                type: this.type,
                value: this.val,
                offset: offs || 0,
                _ok: true,
                cancel: ()=>{ e._ok=false; }
            };
            this.$emit(etype, e );
            return e._ok;
        }
    },
    data: function(){
        return {
            dragoffset: {},
            val: 0
        };
    }
};
    
</script>

<style>

.winresize {
    position: absolute;
    background-color: transparent;
}

.winresize.left {
    top: 0;
    height: 100%;
    left: 0;
    width: 7px;
    cursor: ew-resize;
}

.winresize.right {
    top: 0;
    height: 100%;
    right: 0;
    width: 7px;
    cursor: ew-resize;
}

.winresize.top {
    top: 0;
    height: 7px;
    left: 0;
    width: 100%;
    cursor: ns-resize;
}

.winresize.bottom {
    bottom: 0;
    height: 7px;
    left: 0;
    width: 100%;
    cursor: ns-resize;
}

.winresize.disabled {
    cursor: default;
}
    
</style>

