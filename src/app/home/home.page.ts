import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    public formGroup: FormGroup;
    public mode: 'playing' | 'pause' = 'pause';
    public placeholderText: string = 'Digite alguma coisa...';

    public chips: string[] = [];
    public favorites: string[] = [];

    private static MIN_LENGTH_INPUT = 3;
    private static CHIP_LIST_KEY = '@ChipsList';
    private static FAVORITE_LIST_KEY = '@FavoriteList';
    private static CHIP_MAX_ELEMENTS = 10;


    constructor(private formBuilder: FormBuilder) {
        this.formGroup = formBuilder.group({
            text: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]]
        });
    }

    ionViewWillEnter() {
        this.loadFromStorage();
        this.placeholderText = this.getRandomPlaceholderText();
    }

    public async play(text?: string) {
        const value: string = text || this.formGroup.controls['text'].value;
        if (value && value.trim().length > HomePage.MIN_LENGTH_INPUT && this.mode === 'pause') {
            this.addChips(value);
            await this.speak(value);
        }

        if (this.mode == 'playing')
            this.stopSpeak();
    }

    public resetText() {
        this.formGroup.controls['text'].patchValue('');
        this.formGroup.updateValueAndValidity();
    }

    public addToFavoriteList() {
        const text = this.formGroup.controls['text'].value as string;
        if (text && text.trim().length > HomePage.MIN_LENGTH_INPUT) {
            this.favorites.push(text);
            this.resetText();
            this.updateStorage();
        }
    }

    public removeFavorite(text: string) {
        if (!text)
            return;

        this.favorites = this.favorites.filter(favorite => favorite !== text);
        this.stopSpeak();
        this.updateStorage();
    }

    public addChips(text: string) {
        if (this.chips.includes(text))
            return;

        if (this.chips && this.chips.length >= HomePage.CHIP_MAX_ELEMENTS)
            this.chips.shift();

        this.chips.push(text);
        this.updateStorage();
    }

    public updateStorage() {
        localStorage.setItem(HomePage.CHIP_LIST_KEY, JSON.stringify(this.chips));
        localStorage.setItem(HomePage.FAVORITE_LIST_KEY, JSON.stringify(this.favorites));
    }

    public loadFromStorage() {
        const favorites = localStorage.getItem(HomePage.FAVORITE_LIST_KEY);
        if (favorites) {
            this.favorites = JSON.parse(favorites);
        }

        const chips = localStorage.getItem(HomePage.CHIP_LIST_KEY);
        if (chips) {
            this.chips = JSON.parse(chips);
        }
    }

    public wrapName(text: string): string {
        if (!text || text.trim().length <= 15)
            return text;

        if (text.length > 15)
            return `${text.substring(0, 15)}...`;

        return text;
    }

    private async stopSpeak() {
        this.mode = 'pause';
        await TextToSpeech.stop();
    }

    private async speak(text: string) {
        this.mode = 'playing';
        await TextToSpeech.speak({
            text: text,
            lang: 'pt-BR',
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            category: 'ambient',
        });
        this.mode = 'pause';
        this.resetText();
    }

    private getRandomPlaceholderText(): string {
        const texts = [
            'Digite para transformar em voz!',
            'Escreva alguma frase para transformar em voz!',
            'Você escreve e eu irei reproduzir!',
            'Escreve aí...',
            'O que manda hoje?',
            'Vamo bora!',
            'Qual a boa?'
        ];

        return texts[Math.floor(Math.random() * 6)];
    }

}
