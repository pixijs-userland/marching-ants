import {
    Color,
    type ColorSource,
    Container,
    type ContainerOptions,
    DOMAdapter,
    Texture,
    Ticker,
    TilingSprite
} from 'pixi.js';

/**
 * Options for the MarchingAnts class.
 */
interface MarqueeSelectionOptions extends ContainerOptions
{
    /**
     * Thickness of the line
     * @default 2
     */
    thickness?: number;
    /**
     * Color of the line
     * @default 'white'
     */
    color?: ColorSource;
    /**
     * The dash length
     * @default 2
     */
    dash?: number;
    /**
     * The space between dashes
     * @default 2
     */
    dashSpace?: number;
    /**
     * The speed of the animation
     * @default 0.2
     */
    speed?: number;
    /**
     * The width of the marching ants box
     * @default 100
     */
    width?: number;
    /**
     * The height of the marching ants box
     * @default 100
     */
    height?: number;
    /**
     * Whether to use Ticker.shared to auto update animation time.
     * @default true
     */
    autoUpdate?: boolean;
}

/**
 * Marching Ants is a UI component commonly used
 * to indicate a selection area. It is a dashed line.
 * @see https://en.wikipedia.org/wiki/Marching_ants
 */
class MarqueeSelection extends Container
{
    /** The thickness of the line, set by constructor options */
    public readonly thickness: number;
    /** The color of the line, set by constructor options */
    public readonly dash: number;
    /** The space between dashes, set by constructor options */
    public readonly dashSpace: number;
    /** The speed of the animation, set by constructor options */
    public readonly speed: number;
    /** Used for the top line */
    protected _topLine: TilingSprite;
    /** Used for the left line */
    protected _leftLine: TilingSprite;
    /** Used for the right line */
    protected _rightLine: TilingSprite;
    /** Used for the bottom line */
    protected _bottomLine: TilingSprite;
    /** The texture used for the lines */
    protected _texture: Texture;
    /** `true` uses Ticker.shared to auto update animation time. */
    protected _autoUpdate: boolean = true;
    /** The current time of the animation */
    protected _currentTime = 0;

    /**
     * @param options - The options for the marching ants.
     */
    constructor({
        thickness = 2,
        color = 'white',
        dash = 2,
        dashSpace = 2,
        speed = 0.2,
        width = 100,
        height = 100,
        autoUpdate = true,
        ...rest
    }: MarqueeSelectionOptions = {})
    {
        super(rest);

        this.thickness = thickness;
        this.dash = dash;
        this.dashSpace = dashSpace;
        this.speed = speed;

        // Draw a 4 x 4 texture as a grid
        const canvas = DOMAdapter.get().createCanvas(
            dash + dashSpace,
            dash + dashSpace
        );
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = Color.shared.setValue(color).toRgbaString();
        ctx.fillRect(0, 0, dash, dash);
        const texture = this._texture = Texture.from(canvas);

        texture.source.scaleMode = 'nearest';

        this._topLine = new TilingSprite({
            roundPixels: true,
            texture,
            width,
            height: thickness
        });
        this._leftLine = new TilingSprite({
            roundPixels: true,
            texture,
            width: thickness,
            height,
        });
        this._rightLine = new TilingSprite({
            roundPixels: true,
            texture,
            width: thickness,
            height,
        });
        this._bottomLine = new TilingSprite({
            roundPixels: true,
            texture,
            width,
            height: thickness,
        });
        this.resize(width, height);
        this.addChild(
            this._topLine,
            this._leftLine,
            this._rightLine,
            this._bottomLine
        );
        this.autoUpdate = autoUpdate;
    }

    /**
     * Resize the dimensions
     * @param width - The width of the marching ants box
     * @param height - The height of the marching ants box
     */
    public resize(width: number, height: number)
    {
        const l = this.thickness;

        this._topLine.position.set(-l, -l);
        this._leftLine.position.set(-l, 0);
        this._rightLine.position.set(width, 0);
        this._bottomLine.position.set(-l, height);

        this._topLine.width = width + l * 2;
        this._bottomLine.width = width + l * 2;
        this._leftLine.height = height;
        this._rightLine.height = height;
    }

    /**
     * Update the marching ants animation. This is called automatically
     * if `autoUpdate` is `true` (default). If you'd like to tick this manually
     * set `autoUpdate` to `false` and call this method manually.
     */
    public update()
    {
        if (this.visible)
        {
            this._currentTime += this.speed;
            const size = this.dash + this.dashSpace;
            // avoid large numbers for the position as precision
            // issues will cause this to stop working

            this._topLine.tilePosition.x = this._currentTime % size;
            this._bottomLine.tilePosition.x = -this._currentTime % size;
            this._leftLine.tilePosition.y = -this._currentTime % size;
            this._rightLine.tilePosition.y = this._currentTime % size;
        }
    }

    /** Whether to use Ticker.shared to auto update animation time. */
    public get autoUpdate(): boolean
    {
        return this._autoUpdate;
    }
    public set autoUpdate(value: boolean)
    {
        this._autoUpdate = value;
        Ticker.shared.remove(this.update, this);
        if (value)
        {
            Ticker.shared.add(this.update, this);
        }
    }

    /**
     * Destroy the marching ants, don't use after calling this.
     */
    public destroy()
    {
        this._topLine.destroy();
        this._leftLine.destroy();
        this._rightLine.destroy();
        this._bottomLine.destroy();
        this._texture.destroy(true);
        this.removeChildren();
        super.destroy(true);
        Object.assign(this, {
            _topLine: undefined,
            _leftLine: undefined,
            _rightLine: undefined,
            _bottomLine: undefined,
            _texture: undefined,
        });
    }
}

export { MarqueeSelection };
