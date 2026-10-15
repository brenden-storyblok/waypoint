# Waypoint

Waypoint is a travel site. Editors describe places once and reuse them across pages.

## Language

### Destinations

**Destination**:
A place a traveller can visit, described once as a reusable record.
_Avoid_: Location, place, city

**Destination Page**:
A routable page that presents one Destination.
_Avoid_: Destination detail, landing page

**Country**:
The one country a Destination sits in.

**Destination Attribute**:
A trait from one shared collection that describes what a Destination offers, such as beach, nature or city. A Destination can carry several. Country sits outside this collection.
_Avoid_: Amenity, setting, category, tag, facet

### Finding destinations

**Pool**:
The set of Destinations an editor makes available in one grid. Visitors search and filter within it.
_Avoid_: Scope, selection

**Search Text**:
The words a visitor types to narrow the Destinations shown.
_Avoid_: Query, keyword

**Filter**:
A Country or Destination Attribute a visitor selects to narrow the Destinations shown.
_Avoid_: Facet, refinement

### Page building

**Section**:
A horizontal band of a page that sets its own background and width. A Section holds Layouts and content blocks, but never another Section.
_Avoid_: Container, wrapper, row, band

**Layout**:
An arrangement of blocks inside a Section, either as a flexible row or column, or as a grid of equal columns. A Layout can hold other Layouts.
_Avoid_: Grid (reserved for a Pool's listing), container, columns

**Breakpoint**:
A screen width at which a Layout's arrangement can change. A setting left empty at a Breakpoint inherits the value from the next narrower one.
_Avoid_: Screen size, device
