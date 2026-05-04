namespace SpriteKind {
    export const NPC = SpriteKind.create()
    export const Item = SpriteKind.create()
    export const LogicBug = SpriteKind.create()
    export const Coin = SpriteKind.create()
    export const Projectile_Dragon = SpriteKind.create()
    export const Decoration = SpriteKind.create()
}
/**
 * --- 9. EXTRA CONTENT & DIALOGUE (Lines 260-310) ---
 */
/**
 * DEVELOPER NOTES:
 * 
 * This game uses coordinate tracking for "Win Zones" and Sprite Overlaps
 * 
 * for the dialogue system. The Dragon uses an Interval timer to simulate
 * 
 * a boss phase.
 * 
 * Educational Logic:
 * 
 * - Level 1: Counting (Score >= 3)
 * 
 * - Level 2: Economy/Conditionals (Gold >= 5)
 * 
 * - Level 3: Physics & Projectile Dodging
 */
sprites.onOverlap(SpriteKind.Player, SpriteKind.Projectile_Dragon, function (sprite, proj) {
    proj.destroy()
    info.changeLifeBy(-1)
    scene.cameraShake(4, 500)
    if (info.life() <= 0) {
        game.showLongText("The Truth (and Fire) caught up to you.", DialogLayout.Center)
    }
})
// Talking to NPCs
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    npcs = sprites.allOfKind(SpriteKind.NPC)
    for (let n of npcs) {
        if (hero.overlapsWith(n)) {
            if (currentLevel == 1) {
                if (hasFakeTeeth) {
                    game.showLongText("GUARD: Wow, that's a big tooth! You're a hero! (Liar level increased).", DialogLayout.Bottom)
                    currentLevel += 1
                    // Reset for next level
                    info.setScore(0)
                    setupWorld()
                } else {
                    game.showLongText("GUARD: No tooth? No entry! I'm calling the King!", DialogLayout.Bottom)
                    triggerSuspicion()
                }
            } else if (currentLevel == 2) {
                if (gold >= 5) {
                    game.showLongText("MERCHANT: 5 Coins? I suddenly forgot I ever saw you crying in the woods. Go ahead.", DialogLayout.Bottom)
                    currentLevel += 1
                    setupWorld()
                } else {
                    game.showLongText("MERCHANT: I need 5 Coins to stay quiet, little 'Hero'.", DialogLayout.Bottom)
                }
            }
        }
    }
})
// Picking up Coins
sprites.onOverlap(SpriteKind.Player, SpriteKind.Coin, function (sprite, coin) {
    coin.destroy()
    gold += 1
    music.play(music.melodyPlayable(music.baDing), music.PlaybackMode.InBackground)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, enemy) {
    game.showLongText("DRAGON: You lied about me for FAME? ROOKIE MOVE.", DialogLayout.Center)
    game.over(false)
})
// --- 4. THE WORLD GENERATOR ---
function setupWorld () {
    // Total Reset
    for (let s of sprites.allOfKind(SpriteKind.NPC)) {
        s.destroy()
    }
    for (let t of sprites.allOfKind(SpriteKind.Item)) {
        t.destroy()
    }
    for (let u of sprites.allOfKind(SpriteKind.LogicBug)) {
        u.destroy()
    }
    for (let v of sprites.allOfKind(SpriteKind.Enemy)) {
        v.destroy()
    }
    for (let w of sprites.allOfKind(SpriteKind.Coin)) {
        w.destroy()
    }
    for (let a of sprites.allOfKind(SpriteKind.Decoration)) {
        a.destroy()
    }
    hasFakeTeeth = false
    logicFixed = false
    isFightingDragon = false
    if (currentLevel == 1) {
        scene.setBackgroundColor(13)
        objectiveText = "QUEST: GATHER 3 ROCKS TO FAKE A TOOTH"
        // Level 1 Tilemap
        tiles.setTilemap(tilemap`level3`)
        // Person 1: The Greedy Guard
        guard = sprites.create(img`
            . e e e . f f f . e e e . 
            `, SpriteKind.NPC)
        tiles.placeOnTile(guard, tiles.getTileLocation(8, 2))
        guard.sayText("Proof or Bribe!", 5000, false)
        // Spawn 3 Rocks (Items)
        for (let index = 0; index < 3; index++) {
            rock = sprites.create(img`
                1 
                `, SpriteKind.Item)
            rock.setPosition(Math.randomRange(20, 100), Math.randomRange(20, 100))
        }
    } else if (currentLevel == 2) {
        scene.setBackgroundColor(7)
        objectiveText = "QUEST: BRIBE THE MERCHANT (5 COINS)"
        tiles.setTilemap(tilemap`level2`)
        // Person 2: The Sketchy Merchant
        merchant = sprites.create(img`
            . 3 3 3 . f 1 f . 3 3 3 . 
            `, SpriteKind.NPC)
        tiles.placeOnTile(merchant, tiles.getTileLocation(8, 3))
        merchant.sayText("I know your secret...", 5000, false)
        // Spawn Logic Coins
        for (let index = 0; index < 8; index++) {
            c = sprites.create(img`
                5 
                `, SpriteKind.Coin)
            c.setPosition(Math.randomRange(20, 140), Math.randomRange(20, 100))
        }
        // Logic Bug blocking the Merchant
        bug = sprites.create(img`
            2 2 2 
            `, SpriteKind.LogicBug)
        tiles.placeOnTile(bug, tiles.getTileLocation(4, 3))
    } else if (currentLevel == 3) {
        scene.setBackgroundColor(2)
        objectiveText = "QUEST: ESCAPE THE TRUTH!"
        isFightingDragon = true
        tiles.setTilemap(tilemap`level1`)
        dragon = sprites.create(img`
            . . . . . . . 4 4 4 4 4 . . . . . . . 
            . . . . . . 4 4 4 4 4 4 4 . . . . . . 
            . . . . . 4 4 4 f f 4 4 f f . . . . . 
            . . . . . 4 4 4 f f 4 4 f f . . . . . 
            . . . . . 4 4 4 4 4 4 4 4 4 . . . . . 
            . . . . . 4 4 4 2 2 2 2 2 4 . . . . . 
            . . 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . . 
            . . 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . . 
            . . 4 4 . . . 4 4 4 4 4 . . . 4 4 . . 
            `, SpriteKind.Enemy)
        dragon.scale = 2.5
        tiles.placeOnTile(dragon, tiles.getTileLocation(8, 1))
        dragon.follow(hero, 45)
    }
}
// Fixing the Glitch
sprites.onOverlap(SpriteKind.Player, SpriteKind.LogicBug, function (sprite, bug) {
    bug.destroy()
    logicFixed = true
    for (let k = 1; k < 6; k++) {
        tiles.setTileAt(tiles.getTileLocation(5, k), sprites.castle.tileGrass1)
        tiles.setWallAt(tiles.getTileLocation(5, k), false)
    }
game.showLongText("DEBUG: Path found. Integrity check failed, but continuing anyway.", DialogLayout.Bottom)
})
// --- 7. FAIL & UI SYSTEMS ---
function triggerSuspicion () {
    scene.cameraShake(4, 500)
    info.changeLifeBy(-1)
    suspicionScore += 1
    for (let index = 0; index < 10; index++) {
        sweat = sprites.createProjectileFromSprite(img`
            9 
            `, hero, Math.randomRange(-30, 30), Math.randomRange(-30, 30))
        sweat.lifespan = 500
    }
}
// --- 5. OVERLAP & INTERACTION LOGIC ---
// Picking up Rocks
sprites.onOverlap(SpriteKind.Player, SpriteKind.Item, function (sprite, item) {
    item.destroy()
    info.changeScoreBy(1)
    if (info.score() >= 3) {
        hasFakeTeeth = true
        game.showLongText("You glued the rocks together. It looks like a Dragon Tooth... if you don't look closely.", DialogLayout.Bottom)
    }
})
let funnyThoughts: string[] = []
let fireball: Sprite = null
let trail: Sprite = null
let sweat: Sprite = null
let suspicionScore = 0
let dragon: Sprite = null
let bug: Sprite = null
let c: Sprite = null
let merchant: Sprite = null
let rock: Sprite = null
let guard: Sprite = null
let isFightingDragon = false
let logicFixed = false
let gold = 0
let hasFakeTeeth = false
let npcs: Sprite[] = []
let hero: Sprite = null
let currentLevel = 0
let objectiveText = ""
// --- 2. GAME STATE ---
currentLevel = 1
let dragonHealth = 100
// --- 3. THE HERO ---
hero = sprites.create(img`
    . . . . . . f f f f . . . . . . 
    . . . . f f f 2 2 f f f . . . . 
    . . . f f f 2 2 2 2 f f f . . . 
    . . f f f e e e e e e f f f . . 
    . . f f e 2 2 2 2 2 2 e e f . . 
    . f f e 2 f f f f f f 2 e f f . 
    . f f f f f e e e e f f f f f . 
    . . f e e f b f b f e e f . . . 
    . . f e 4 1 f d f 1 4 e f . . . 
    . . . f e 4 d d d 4 e f . . . . 
    . . . . f e e 4 e e f . . . . . 
    `, SpriteKind.Player)
controller.moveSprite(hero, 100, 100)
scene.cameraFollowSprite(hero)
info.setLife(3)
info.setScore(0)
// --- 8. INITIALIZATION ---
game.splash("THE COWARD'S CROWN", "Legendary Edition")
game.showLongText("D-Pad: Move\\nA: Talk to People\\nGoal: Escape before they find out you're a fake!", DialogLayout.Center)
setupWorld()
game.onUpdate(function () {
    screen.print(objectiveText, 5, 5, 1, image.font5)
// Win Condition (Reach Left side of cave)
    if (currentLevel == 3 && hero.x < 15) {
        game.over(true, effects.confetti)
    }
})
// Final polish: Particle trail when moving
game.onUpdate(function () {
    if (controller.dx() != 0 || controller.dy() != 0) {
        trail = sprites.createProjectileFromSprite(img`
            f 
            `, hero, 0, 0)
        trail.lifespan = 200
        trail.setFlag(SpriteFlag.Ghost, true)
    }
})
// --- 6. DRAGON ATTACK SYSTEM ---
game.onUpdateInterval(2000, function () {
    if (isFightingDragon) {
        fireball = sprites.createProjectileFromSide(img`
            2 4 5 
            `, 160, hero.y)
        fireball.setKind(SpriteKind.Projectile_Dragon)
        fireball.vx = -100
        fireball.sayText("LIES!", 500)
    }
})
game.onUpdateInterval(6000, function () {
    if (currentLevel < 3) {
        funnyThoughts = [
        "Does this cape make me look brave?",
        "I hope there are no real dragons.",
        "I should've practiced my scary face.",
        "That rock smells like glue.",
        "I wonder if I can lie to the Dragon?"
        ]
        hero.sayText(funnyThoughts[Math.randomRange(0, 4)], 2000)
    }
})
