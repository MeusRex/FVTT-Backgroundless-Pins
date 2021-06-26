Hooks.on("init", () => {
    // Override map notes to use the BackgroundlessControlIcon
    Note.prototype._drawControlIcon = function () {
        let tint = this.data.iconTint ? colorStringToHex(this.data.iconTint) : null;
        let iconData = { texture: this.data.icon, size: this.size, tint: tint };
        let icon;
	// this is note
        if (this.getFlag("backgroundless-pins", "hasBackground")) {
            icon = new ControlIcon(iconData);
        } else {
            icon = new BackgroundlessControlIcon(iconData);
	    icon.scale.x = this.getFlag("backgroundless-pins", "ratio");
        }
        icon.x -= this.size / 2;
        icon.y -= this.size / 2;
        return icon;
    };
	
	// Keep tooltip always visible
	// Though could make an option out of that too. Would be nicer
    Note.prototype.refresh = function() {
	this.position.set(this.data.x, this.data.y);
	this.controlIcon.border.visible = this._hover;
	this.tooltip.visible = true;
	this.visible = this.entry?.testUserPermission(game.user, "LIMITED") ?? true;
	return this;
    }
	
	// Override map notes to use the BackgroundlessControlIcon 
	//Note.prototype._drawTooltip = function() {
	//	// Create the Text object
	//	const textStyle = this._getTextStyle();
	//	const text = new PreciseText(this.text, textStyle);
	//	text.visible = false;
	//	const halfPad = (0.5 * this.size) + 12;
//
		// Configure Text position
	//	switch ( this.data.textAnchor ) {
	//	  case CONST.TEXT_ANCHOR_POINTS.CENTER:
	//		text.anchor.set(0.5, 0.5);
	//		text.position.set(0, 0);
	//		break;
	//	  case CONST.TEXT_ANCHOR_POINTS.BOTTOM:
	//		text.anchor.set(0.5, 0);
	//		text.position.set(0, halfPad);
	//		break;
	//	  case CONST.TEXT_ANCHOR_POINTS.TOP:
	//		text.anchor.set(0.5, 1);
	//		text.position.set(0, -halfPad);
	//		break;
	//	  case CONST.TEXT_ANCHOR_POINTS.LEFT:
	//		text.anchor.set(1, 0.5);
	//		text.position.set(-halfPad, 0);
	//		break;
	//	  case CONST.TEXT_ANCHOR_POINTS.RIGHT:
	//		text.anchor.set(0, 0.5);
	//		text.position.set(halfPad, 0);
	//		break;
	//	}
	//	return text;
    //}
});

Hooks.on("renderNoteConfig", (noteConfig, html, _) => {
    const hasBackground = noteConfig.object.getFlag("backgroundless-pins", "hasBackground") ?? false;
    const iconTintGroup = html.find("[name=iconTint]").closest(".form-group");
    const ratio = noteConfig.object.getFlag("backgroundless-pins", "ratio") ?? 1;
    const iconSizeGroup = html.find("[name=iconSize]").closest(".form-group");
    
    iconTintGroup.after(`
        <div class="form-group">
            <label for="flags.backgroundless-pins.hasBackground">Show Background?</label>
            <input type="checkbox" name="flags.backgroundless-pins.hasBackground" data-dtype="Boolean" ${hasBackground ? "checked" : ""}>
        </div>
    `);
    noteConfig.setPosition({ height: "auto" });
    
    iconSizeGroup.after(`
        <div class="form-group">
            <label for="flags.backgroundless-pins.ratio">Width to Size Ratio</label>
            <input type="text" name="flags.backgroundless-pins.ratio" data-dtype="Number" value="${ratio}">
        </div>
    `);
});

export class BackgroundlessControlIcon extends ControlIcon {
    /**
     * Override ControlIcon#draw to remove drawing of the background.
     */
    async draw() {
        // Draw border
        this.border
            .clear()
            .lineStyle(2, this.borderColor, 1.0)
            .drawRoundedRect(...this.rect, 5)
            .endFill();
        this.border.visible = false;

        // Draw icon
        this.icon.texture = this.texture ?? (await loadTexture(this.iconSrc));
        this.icon.height = this.icon.width = this.size;
        this.icon.tint = Number.isNumeric(this.tintColor) ? this.tintColor : 0xffffff;
		
	// Horribly hacky. Like for real...
	let note = this.parent;
	let ratio = note.getFlag("backgroundless-pins", "ratio");
	let size = note.size;
	let text = note.children[1];
	text.x = (size * (ratio - 1)) / 2;
		
        return this;
    }
}

//export class BackgroundlessControlIconText extends PreciseText {

//}
