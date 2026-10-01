package com.rmr.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import com.rmr.backend.context.AccountRepository;
import com.rmr.backend.context.FollowRepository;
import com.rmr.backend.model.Account;
import com.rmr.backend.model.Follow;
import com.rmr.backend.type.FollowStatusType;

class FollowServiceTest {

	@Test
	void followReusesExistingInvalidRowInsteadOfCreatingDuplicate() {
		FollowRepository rep = mock(FollowRepository.class);
		AccountRepository aRep = mock(AccountRepository.class);
		NotificationService notificationService = mock(NotificationService.class);
		Account user = Account.builder().userId(1).build();
		Account follower = Account.builder().userId(2).build();
		Follow existing = Follow.builder().id(10).user(user).follower(follower)
				.statusType(FollowStatusType.INVALID).build();
		when(rep.findByUserUserIdAndFollowerUserId(1, 2)).thenReturn(Optional.of(existing));
		when(rep.save(any(Follow.class))).thenAnswer(invocation -> invocation.getArgument(0));

		FollowService service = new FollowService(rep, aRep, notificationService);
		Follow result = service.follow(1, 2);

		assertThat(result.getId()).isEqualTo(10);
		assertThat(result.getStatusType()).isEqualTo(FollowStatusType.VALID);
		verify(rep, times(1)).save(any(Follow.class));
		verify(aRep, never()).findByUserId(any());
	}

	@Test
	void followThrowsConflictWhenAlreadyFollowing() {
		FollowRepository rep = mock(FollowRepository.class);
		AccountRepository aRep = mock(AccountRepository.class);
		NotificationService notificationService = mock(NotificationService.class);
		Account user = Account.builder().userId(1).build();
		Account follower = Account.builder().userId(2).build();
		Follow existing = Follow.builder().id(10).user(user).follower(follower)
				.statusType(FollowStatusType.VALID).build();
		when(rep.findByUserUserIdAndFollowerUserId(1, 2)).thenReturn(Optional.of(existing));

		FollowService service = new FollowService(rep, aRep, notificationService);

		assertThrows(ResponseStatusException.class, () -> service.follow(1, 2));
		verify(rep, never()).save(any(Follow.class));
	}

	@Test
	void followCreatesNewRowWhenNoPriorRecordExists() {
		FollowRepository rep = mock(FollowRepository.class);
		AccountRepository aRep = mock(AccountRepository.class);
		NotificationService notificationService = mock(NotificationService.class);
		Account user = Account.builder().userId(1).build();
		Account follower = Account.builder().userId(2).build();
		when(rep.findByUserUserIdAndFollowerUserId(1, 2)).thenReturn(Optional.empty());
		when(aRep.findByUserId(1)).thenReturn(Optional.of(user));
		when(aRep.findByUserId(2)).thenReturn(Optional.of(follower));
		when(rep.save(any(Follow.class))).thenAnswer(invocation -> invocation.getArgument(0));

		FollowService service = new FollowService(rep, aRep, notificationService);
		Follow result = service.follow(1, 2);

		assertThat(result.getStatusType()).isEqualTo(FollowStatusType.VALID);
		assertThat(result.getUser()).isEqualTo(user);
		assertThat(result.getFollower()).isEqualTo(follower);
	}
}
