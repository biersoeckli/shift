import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { ListUtils } from 'src/app/shift-common/utils/list.utils';


interface VolunteerCategories {
  user: Parse.Object<Parse.Attributes>;
  userEventCategories: Parse.Object<Parse.Attributes>[];
  categoriesCount: number;
}

interface EventWithVolunteerCategory {
  volunteers: VolunteerCategories[];
  volunteersCount: number;
  category: Parse.Object<Parse.Attributes>;
}

@Component({
  selector: 'app-volunteer-assigment-suggestion',
  templateUrl: './volunteer-assigment-suggestion.component.html'
})
export class VolunteerAssigmentSuggestionComponent extends BaseComponent<void> implements OnInit {

  @Input() eventId?: string;
  eventWithVolunteerCategory?: EventWithVolunteerCategory[];
  notAssignedVolunteers?: VolunteerCategories[];

  constructor(common: CommonService) {
    super(common);
  }

  async ngOnInit() {
    if (!this.eventId) {
      return;
    }
    const [allEventCategories, userEvents, userEventCategories] = await Promise.all([
      await this.eventService.getEventCategories(this.eventId),
      await this.eventService.getUserEvents(this.eventId),
      await this.eventService.fetchAllUserEventCategory(this.eventId)
    ]);

    const relevantEventCategories = allEventCategories.filter(category => category.get('availableForRegistration'));
    let availableVolunteerCategories = this.evaluateAllUserCategories(userEvents, userEventCategories);
    const eventWithVolunteerCategory = this.evaluateAllEventsWithVolunteerCount(relevantEventCategories, userEventCategories);

    eventWithVolunteerCategory.forEach(eventWithVolunteerCategory => {
      const bestMatchingVolunteers = this.getBestMatchingVolunteersForCategory(availableVolunteerCategories, eventWithVolunteerCategory.category.id, eventWithVolunteerCategory.category.get('volunteerLimit'));
      availableVolunteerCategories = availableVolunteerCategories.filter(volunteerCategory => !bestMatchingVolunteers.includes(volunteerCategory));
      eventWithVolunteerCategory.volunteers = bestMatchingVolunteers;
    });

    this.eventWithVolunteerCategory = eventWithVolunteerCategory;
    this.notAssignedVolunteers = availableVolunteerCategories;
  }

  private getBestMatchingVolunteersForCategory(volunteerCategories: VolunteerCategories[], categoryId: string, limit = 5) {
    return volunteerCategories
      .filter(volunteerCategory =>
        volunteerCategory.userEventCategories.some(userEventCategory => userEventCategory.get('category').id === categoryId))
      .slice(0, limit);
  }

  private evaluateAllEventsWithVolunteerCount(eventCategories: Parse.Object<Parse.Attributes>[], userEventCategories: Parse.Object<Parse.Attributes>[]) {
    const eventWithVolunteerCategory = eventCategories.map(category => {
      const volunteers = userEventCategories.filter(userEventCategory => userEventCategory.get('category').id === category.id);
      return {
        volunteersCount: volunteers.length,
        category
      } as EventWithVolunteerCategory;
    });
    return ListUtils.sortListByPropertyAsc(eventWithVolunteerCategory, 'volunteersCount');
  }

  private evaluateAllUserCategories(userEvents: Parse.Object<Parse.Attributes>[], userEventCategories: Parse.Object<Parse.Attributes>[]) {
    const userCategories = userEvents.map(userEvent => {
      const categories = userEventCategories.filter(eventCategory => eventCategory.get('user').id === userEvent.get('user').id);
      return {
        user: userEvent.get('user'),
        userEventCategories: categories,
        categoriesCount: categories.length
      } as VolunteerCategories;
    });
    return ListUtils.sortListByPropertyAsc(userCategories, 'categoriesCount');
  }
}
