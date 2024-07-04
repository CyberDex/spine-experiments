import { Application } from 'pixi.js';
import { Loader } from 'pixi.js';

import './style.css';
import { addSpine, spine } from './spine';
import { ISkeletonData, Spine } from 'pixi-spine';

export const app = new Application({
    resizeTo: window,
    backgroundAlpha: 0,
});

document.body.appendChild(app.view);

(globalThis as any).__PIXI_APP__ = app;

export const loader = new Loader();

let fileHandle: any;

addEventListener('dblclick', async () => {
    [fileHandle] = await (window as any).showOpenFilePicker();

    await loadAndCreateSpine(fileHandle);
});

document.getElementById('openSpine')?.addEventListener('click', async () => {
    [fileHandle] = await (window as any).showOpenFilePicker();

    await loadAndCreateSpine(fileHandle);
});

document.addEventListener('dragover', (e) => {
    // Prevent navigation.
    e.preventDefault();
});

document.addEventListener('drop', async (e: any) => {
    e.preventDefault();

    const fileHandlesPromises = [...e.dataTransfer.items]
        .filter((item) => item.kind === 'file')
        .map((item) => item.getAsFileSystemHandle());

    for await (const handle of fileHandlesPromises) {
        if (handle.kind === 'directory') {
            console.log(`Directory: ${handle.name}`);
        } else {
            console.log(`loading file: ${handle.name}`, handle);
            await loadAndCreateSpine(handle);
        }
    }
});

function loadAndCreateSpine(fileHandle: any) {
    if (loader.resources[fileHandle.name]) {
        const spineData = loader.resources[fileHandle.name].spineData as ISkeletonData;

        createSpine(spineData);

        return;
    }

    loader.add(fileHandle).load(() => {
        if (loader.resources[fileHandle.name].error) {
            console.error(
                `Error loading ${fileHandle.name}`,
                loader.resources[fileHandle.name].error,
            );

            return;
        }

        if (!loader.resources[fileHandle.name].spineData) {
            console.error(`No spine data found for ${fileHandle.name}`, loader.resources);

            return;
        }

        createSpine(loader.resources[fileHandle.name].spineData);
    });
}

function createSpine(spineData: ISkeletonData) {
    if (!spineData) {
        console.error('No spine data found');

        return;
    }

    addAnimationsSelector(spineData.animations?.map((animation) => animation.name));

    addSpine(spineData);
}

function addAnimationsSelector(animations: string[]) {
    if (!animations) return;

    const animationSelector = document.getElementById('animationSelector');
    const animationsList = document.getElementById('animationsList');

    if (!animationSelector) return;

    animationSelector.style.visibility = animations.length > 0 ? 'visible' : 'hidden';

    if (!animationsList) return;

    animationsList.innerHTML = '';

    animations.forEach((animation) => {
        console.log(animation);

        const option = document.createElement('a');

        option.innerHTML = animation;

        option.addEventListener('click', () => {
            spine.state.setAnimation(0, animation, false);
        });

        animationsList.appendChild(option);
    });
}
