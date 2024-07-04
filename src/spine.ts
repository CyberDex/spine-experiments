import { ISkeletonData, Spine } from 'pixi-spine';
import { app } from './main';

export let spine: Spine;

export function addSpine(spineData: ISkeletonData): Spine {
    if (spine) {
        spine.destroy();
    }

    spine = new Spine(spineData);

    app.stage.addChild(spine as any);

    spine.position.set(window.innerWidth / 2, window.innerHeight / 2);

    tryToPlayIdleAnimation(spineData);

    return spine;
}

function tryToPlayIdleAnimation(spineData: ISkeletonData) {
    const idleAnimation = spineData.animations.find(
        (animation) => animation.name === 'idle' || animation.name.includes('idle'),
    );

    if (idleAnimation) {
        spine.state.setAnimation(0, idleAnimation.name, true);

        spine.state.addListener({
            complete: (data) => {
                if (!data.loop) {
                    spine.state.setAnimation(0, idleAnimation.name, true);
                }
            },
        });
    }
}

export function playOnce(animation: string) {
    if (!spine) return;

    spine.state.setAnimation(0, animation, false);
}
